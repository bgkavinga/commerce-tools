#!/usr/bin/env node
import 'dotenv/config';
import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { commercePrompt } from './prompts/commerce.js';
import { securityPrompt } from './prompts/security.js';
import {
  ensureApiKey,
  getApiKey,
  getDefaultAccountId,
  runExecuteNrql,
  runGetAccountIdByProjectId,
} from './tools.js';

const server = new McpServer(
  { name: 'newrelic-nrql', version: '0.1.0' },
  { instructions: 'Execute NRQL queries against New Relic via NerdGraph.' },
);

server.registerPrompt(
  'newrelic_commerce',
  {
    description:
      'New Relic NRQL specialist for Adobe Commerce and general querying. Resolves project IDs to account IDs and runs NRQL queries.',
    argsSchema: {
      project_id: z.string().optional().describe('Adobe Commerce project ID to pre-fill in the prompt'),
    },
  },
  ({ project_id }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: project_id ? commercePrompt.replace(/<project id>/g, project_id) : commercePrompt,
        },
      },
    ],
  }),
);

server.registerPrompt(
  'newrelic_security',
  {
    description:
      'New Relic security analyst for Adobe Commerce. Detects and investigates attacks (brute force, SQLi, XSS, DDoS, scraping, etc.) using NRQL queries.',
    argsSchema: {
      project_id: z.string().optional().describe('Adobe Commerce project ID to pre-fill in the prompt'),
    },
  },
  ({ project_id }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: project_id ? securityPrompt.replace(/<project id>/g, project_id) : securityPrompt,
        },
      },
    ],
  }),
);

server.registerTool(
  'execute_nrql',
  {
    title: 'Execute NRQL Query',
    description: 'Run a NRQL query against a New Relic account via NerdGraph.',
    inputSchema: z.object({
      query: z.string().min(1).describe('The NRQL query to execute'),
      account_id: z
        .number()
        .int()
        .optional()
        .describe('New Relic account ID (uses NEW_RELIC_ACCOUNT_ID env var if omitted)'),
      timeout_seconds: z
        .number()
        .int()
        .min(1)
        .max(70)
        .optional()
        .describe('Request timeout in seconds (default 30)'),
    }),
  },
  async ({ query, account_id, timeout_seconds }) => {
    const resolvedAccountId = account_id ?? getDefaultAccountId();
    if (resolvedAccountId === null) {
      throw new Error(
        'account_id is required. Pass it to this tool or set NEW_RELIC_ACCOUNT_ID in the environment.',
      );
    }
    const text = await runExecuteNrql(query, resolvedAccountId, timeout_seconds ?? 30);
    return { content: [{ type: 'text', text }] };
  },
);

server.registerTool(
  'get_account_id_by_project_id',
  {
    title: 'Get Account ID by Project ID',
    description: 'Look up a New Relic account ID for an Adobe Commerce project ID via entity search.',
    inputSchema: z.object({
      project_id: z.string().min(1).describe('Adobe Commerce project ID'),
    }),
  },
  async ({ project_id }) => {
    const text = await runGetAccountIdByProjectId(project_id);
    return { content: [{ type: 'text', text }] };
  },
);

async function main() {
  ensureApiKey(getApiKey());
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('New Relic MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
