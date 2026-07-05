#!/usr/bin/env node
import 'dotenv/config';
import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ensureJiraAuth, runGetJiraIssue } from './tools.js';

const server = new McpServer(
  { name: 'jira', version: '0.1.0' },
  { instructions: 'Fetch a Jira issue and surface any New Relic account/project id mentioned in its text.' },
);

server.registerTool(
  'get_jira_issue',
  {
    title: 'Get Jira Issue',
    description:
      'Fetch a Jira issue by key (e.g. PRO-234): summary, status, description, comments, and a best-effort extraction of a New Relic account/project id mentioned in the text. If extractedIds is empty, ask the user for the New Relic id before proceeding.',
    inputSchema: z.object({
      issue_key: z.string().min(1).describe('Jira issue key, e.g. PRO-234'),
    }),
  },
  async ({ issue_key }) => {
    const text = await runGetJiraIssue(issue_key);
    return { content: [{ type: 'text', text }] };
  },
);

async function main() {
  ensureJiraAuth();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jira MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
