import type { Entity } from './types.js';
import { ENTITY_SEARCH_QUERY, NRQL_SINGLE_ACCOUNT_QUERY } from './queries.js';

const GRAPHQL_URL_US = 'https://api.newrelic.com/graphql';
const GRAPHQL_URL_EU = 'https://api.eu.newrelic.com/graphql';
const DEFAULT_TIMEOUT_SECONDS = 60;

export function getApiKey(): string {
  return (process.env.NEW_RELIC_API_KEY ?? '').trim();
}

export function getBaseUrl(): string {
  const region = (process.env.NEW_RELIC_REGION ?? 'us').trim().toLowerCase();
  return region === 'eu' ? GRAPHQL_URL_EU : GRAPHQL_URL_US;
}

export function getDefaultAccountId(): number | null {
  const str = (process.env.NEW_RELIC_ACCOUNT_ID ?? '').trim();
  if (!str) return null;
  const parsed = Number.parseInt(str, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function ensureApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new Error(
      'NEW_RELIC_API_KEY is not set. Set it in the environment or .env before running the server.',
    );
  }
}

export async function executeNerdgraph(
  query: string,
  variables: Record<string, unknown>,
  timeoutSeconds: number = DEFAULT_TIMEOUT_SECONDS,
): Promise<Record<string, unknown>> {
  const apiKey = getApiKey();
  ensureApiKey(apiKey);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, timeoutSeconds) * 1000);

  try {
    const response = await fetch(getBaseUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-Key': apiKey,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    const body = (await response.json()) as Record<string, unknown>;

    if (response.status !== 200) {
      const message =
        typeof body.message === 'string'
          ? body.message
          : typeof body.error === 'string'
            ? body.error
            : JSON.stringify(body);
      throw new Error(`NerdGraph request failed (HTTP ${response.status}): ${message}`);
    }

    const errors = body.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const messages = errors
        .map((e) =>
          typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message?: unknown }).message ?? JSON.stringify(e))
            : JSON.stringify(e),
        )
        .join('; ');
      throw new Error(`NerdGraph returned errors: ${messages}`);
    }

    return body;
  } finally {
    clearTimeout(timer);
  }
}

function extractNrqlResults(data: Record<string, unknown>): unknown[] {
  const actor = (data.data as { actor?: unknown } | undefined)?.actor as
    | { account?: unknown }
    | undefined;
  const account = actor?.account as { nrql?: unknown } | undefined;
  const nrql = account?.nrql as { results?: unknown } | undefined;
  return Array.isArray(nrql?.results) ? nrql.results : [];
}

function extractEntitySearchEntities(data: Record<string, unknown>): Entity[] {
  const actor = (data.data as { actor?: unknown } | undefined)?.actor as
    | { entitySearch?: unknown }
    | undefined;
  const entitySearch = actor?.entitySearch as { results?: unknown } | undefined;
  const results = entitySearch?.results as { entities?: unknown } | undefined;
  return Array.isArray(results?.entities) ? (results.entities as Entity[]) : [];
}

export async function runExecuteNrql(
  query: string,
  accountId: number,
  timeoutSeconds: number,
): Promise<string> {
  const body = await executeNerdgraph(
    NRQL_SINGLE_ACCOUNT_QUERY,
    { accountId, nrql: query.trim() },
    timeoutSeconds,
  );
  return JSON.stringify(extractNrqlResults(body), null, 2);
}

export async function runGetAccountIdByProjectId(projectId: string): Promise<string> {
  const trimmedId = projectId.trim();
  if (!trimmedId) throw new Error('project_id is required and must be non-empty.');

  const safeId = trimmedId.replace(/'/g, "\\'");
  const searchQuery = `tags.account LIKE '%${safeId}%' AND domain = 'APM' AND name = '${safeId}'`;

  const body = await executeNerdgraph(ENTITY_SEARCH_QUERY, { searchQuery }, 30);
  const entities = extractEntitySearchEntities(body);

  if (entities.length === 0) {
    return JSON.stringify(
      { found: false, message: `No entities found for project_id: ${trimmedId}`, entities: [] },
      null,
      2,
    );
  }

  return JSON.stringify(
    {
      found: true,
      count: entities.length,
      entities: entities.map((e) => ({
        accountId: e.accountId,
        guid: e.guid,
        name: e.name,
        tags: e.tags,
      })),
    },
    null,
    2,
  );
}
