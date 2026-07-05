import type { ExtractedIds, JiraIssueResponse } from './types.js';

const DEFAULT_TIMEOUT_SECONDS = 30;
const ISSUE_FIELDS = 'summary,description,comment,status,assignee,reporter';

const ACCOUNT_ID_PATTERNS: RegExp[] = [
  /new relic account(?:\s*id)?[:\s]+(\d{5,})/i,
  /account[\s_-]?id[:\s]*(\d{5,})/i,
  /accountId=(\d+)/i,
];

const PROJECT_ID_PATTERNS: RegExp[] = [
  /new relic project(?:\s*id)?[:\s]+([\w-]{3,})/i,
  /project[\s_-]?id[:\s]*([\w-]{3,})/i,
];

export function getJiraBaseUrl(): string {
  return (process.env.JIRA_BASE_URL ?? '').trim().replace(/\/+$/, '');
}

export function getJiraEmail(): string {
  return (process.env.JIRA_EMAIL ?? '').trim();
}

export function getJiraApiToken(): string {
  return (process.env.JIRA_API_TOKEN ?? '').trim();
}

export function ensureJiraAuth(): void {
  const missing = [
    !getJiraBaseUrl() && 'JIRA_BASE_URL',
    !getJiraEmail() && 'JIRA_EMAIL',
    !getJiraApiToken() && 'JIRA_API_TOKEN',
  ].filter((v): v is string => Boolean(v));

  if (missing.length > 0) {
    throw new Error(
      `${missing.join(', ')} not set. Set ${missing.length > 1 ? 'them' : 'it'} in the environment or .env before running the server.`,
    );
  }
}

function buildAuthHeader(): string {
  const credentials = `${getJiraEmail()}:${getJiraApiToken()}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

export async function fetchJiraIssue(
  issueKey: string,
  timeoutSeconds: number = DEFAULT_TIMEOUT_SECONDS,
): Promise<JiraIssueResponse> {
  const trimmedKey = issueKey.trim();
  if (!trimmedKey) throw new Error('issue_key is required and must be non-empty.');

  const url = `${getJiraBaseUrl()}/rest/api/3/issue/${encodeURIComponent(trimmedKey)}?fields=${ISSUE_FIELDS}&expand=renderedFields`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, timeoutSeconds) * 1000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: buildAuthHeader(),
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (response.status === 404) {
      throw new Error(`Issue ${trimmedKey} not found (check the key and JIRA_BASE_URL).`);
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Jira request failed (HTTP ${response.status}): check JIRA_EMAIL and JIRA_API_TOKEN.`,
      );
    }

    const body = (await response.json()) as Record<string, unknown>;

    if (response.status !== 200) {
      const errorMessages = Array.isArray(body.errorMessages) ? (body.errorMessages as string[]) : [];
      const errors = (body.errors as Record<string, string> | undefined) ?? {};
      const messages = [...errorMessages, ...Object.entries(errors).map(([k, v]) => `${k}: ${v}`)];
      throw new Error(
        `Jira request failed (HTTP ${response.status}): ${messages.length > 0 ? messages.join('; ') : JSON.stringify(body)}`,
      );
    }

    return body as unknown as JiraIssueResponse;
  } finally {
    clearTimeout(timer);
  }
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function flattenComments(comments: Array<{ body: string }>): string {
  if (comments.length === 0) return '';
  return comments.map((c) => stripHtml(c.body)).join('\n---\n');
}

export function extractIds(text: string): ExtractedIds {
  const result: ExtractedIds = {};

  for (const pattern of ACCOUNT_ID_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      result.accountId = match[1];
      break;
    }
  }

  for (const pattern of PROJECT_ID_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      result.projectId = match[1];
      break;
    }
  }

  return result;
}

export async function runGetJiraIssue(issueKey: string): Promise<string> {
  const issue = await fetchJiraIssue(issueKey);

  const descriptionText = issue.renderedFields?.description
    ? stripHtml(issue.renderedFields.description)
    : '(no description)';
  const commentsText = issue.renderedFields?.comment?.comments
    ? flattenComments(issue.renderedFields.comment.comments) || '(no comments)'
    : '(no comments)';

  const extractedIds = extractIds(`${descriptionText}\n${commentsText}`);

  return JSON.stringify(
    {
      key: issue.key,
      url: `${getJiraBaseUrl()}/browse/${issue.key}`,
      summary: issue.fields.summary,
      status: issue.fields.status?.name ?? '',
      descriptionText,
      commentsText,
      extractedIds,
    },
    null,
    2,
  );
}
