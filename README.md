# commerce-tools

A modular AI tooling platform for Adobe Commerce operations, monitoring, and security analysis. Provides New Relic and Jira MCP servers, plus a composable framework of agents, skills, commands, and providers for building AI-powered Commerce workflows.

## Features

- **New Relic MCP Server** — executes NRQL queries via NerdGraph and maps Adobe Commerce project IDs to New Relic account IDs
- **Jira MCP Server** — fetches a Jira issue by key and extracts any New Relic account/project id mentioned in its description or comments
- **Jira → New Relic Triage Workflow** — a `work-on-ticket` command and `jira-newrelic-triage` skill that chain the two MCP servers to investigate a ticket end-to-end
- **Commerce & Security Prompts** — built-in specialist prompts for APM monitoring, performance analysis, and attack detection (brute force, SQLi, XSS, DDoS, scraping, carding)
- **Agent Framework** — automatic tool-use loop with conversation history management and configurable iteration limits
- **Pluggable Providers** — abstract provider interface supports Claude and other LLM backends
- **Hook System** — event-driven extensibility with `before-tool`, `after-tool`, `before-generate`, and `after-generate` hooks
- **Composable CLI** — command, skill, and agent registries for building and extending tools

## Project Structure

```
commerce-tools/
├── agents/        # Agent implementations (extend BaseAgent)
├── commands/      # CLI command registry
├── core/          # Runtime: router, tool-runner, session, hooks
├── mcps/          # MCP servers (New Relic NRQL, Jira)
├── plugins/       # Claude/Cursor plugin build (commands, skills, mcp config)
├── providers/     # AI provider implementations and base types
├── skills/        # Skill registry and loaders
├── dist/          # Compiled output (generated)
├── .env.example   # Environment variable template
└── .mcp.json      # MCP server config for Claude Code
```

## Getting Started

### Prerequisites

- Node.js 18+
- A New Relic account with a [NerdGraph API key](https://docs.newrelic.com/docs/apis/nerdgraph/get-started/introduction-new-relic-nerdgraph/)
- A Jira Cloud site with an [API token](https://id.atlassian.com/manage-profile/security/api-tokens) (only needed for the Jira MCP server)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEW_RELIC_API_KEY` | NerdGraph API key |
| `NEW_RELIC_REGION` | `us` or `eu` (default: `us`) |
| `NEW_RELIC_ACCOUNT_ID` | Optional default account ID |
| `JIRA_BASE_URL` | Jira site URL, e.g. `https://yourcompany.atlassian.net` |
| `JIRA_EMAIL` | Email of the account owning the API token |
| `JIRA_API_TOKEN` | Jira API token |
| `MCP_TRANSPORT` | Transport mode (default: `stdio`) |

### Build

```bash
npm run build
```

### Run the New Relic MCP server

```bash
npm start
# or directly:
node dist/mcps/newrelic/server.js
```

### Run the Jira MCP server

```bash
npm run start:jira
# or directly:
node dist/mcps/jira/server.js
```

## Using with Claude Code

The `.mcp.json` file configures both the New Relic and Jira MCP servers for use with Claude Code. To register them manually instead:

```bash
claude mcp add newrelic -- node /path/to/commerce-tools/dist/mcps/newrelic/server.js
claude mcp add jira -- node /path/to/commerce-tools/dist/mcps/jira/server.js
```

Or reference the existing `.mcp.json` in your Claude Code project settings. Once connected, Claude can:

- Run NRQL queries against any New Relic account
- Resolve Adobe Commerce project IDs to account IDs
- Analyze logs, transactions, APM metrics, Redis, MySQL, and Elasticsearch data
- Detect and investigate security attacks
- Fetch a Jira issue by key and pull its summary, status, description, and comments
- Chain a Jira ticket straight into a New Relic investigation via the `jira-newrelic-triage` workflow below

## Architecture

### Core

| Module | Purpose |
|---|---|
| `core/router.ts` | Resolves provider names to implementations |
| `core/tool-runner.ts` | Registers and dispatches tool handlers |
| `core/session.ts` | Manages conversation sessions and message history |
| `core/hooks.ts` | Event hooks for tool and generation lifecycle |

### Agents

`agents/_base.ts` implements the agentic loop:

1. Call `provider.generate()` with current messages and tools
2. Append assistant response to history
3. If stop reason is `tool_use`, extract and execute tool calls
4. Append tool results to history
5. Repeat up to `maxIterations` (default: 10)

Subclass `BaseAgent` and implement `handleToolCall()` to build custom agents.

### New Relic MCP Tools

| Tool | Description |
|---|---|
| `execute_nrql` | Run a NRQL query against a New Relic account via NerdGraph |
| `get_account_id_by_project_id` | Resolve an Adobe Commerce project ID to a New Relic account ID |

### New Relic MCP Prompts

| Prompt | Description |
|---|---|
| `newrelic_commerce` | NRQL specialist for Adobe Commerce monitoring and investigation |
| `newrelic_security` | Extends commerce prompt with attack detection and security analysis |

### Jira MCP Tools

| Tool | Description |
|---|---|
| `get_jira_issue` | Fetch a Jira issue by key (e.g. `PRO-234`): summary, status, description, comments, and a best-effort extraction of a New Relic account/project id mentioned in the text |

### Jira → New Relic Triage Workflow

The Jira MCP is paired with a prompt (`mcps/jira/prompts/workflow.ts`) that drives an end-to-end investigation of a ticket:

1. **Fetch the ticket** via `get_jira_issue`.
2. **Check `extractedIds`** in the result — if an `accountId` or `projectId` was found in the description/comments, use it. If both are empty, the workflow asks the user for one rather than guessing.
3. **Resolve the New Relic account**, calling `get_account_id_by_project_id` first if only a project ID is known.
4. **Investigate with NRQL** via `execute_nrql`, following the `newrelic_commerce` prompt's field-discovery rules.
5. **Summarize findings** back to the user, referencing the ticket key/summary. The ticket itself is never modified — no comments or status changes are made.

This workflow ships as a Claude Code plugin (see `plugins/claude/`):

- **Command** — `/work-on-ticket <issue-key>` runs the workflow directly for a given ticket.
- **Skill** — `jira-newrelic-triage` is auto-invoked when you mention working on, investigating, or triaging a Jira ticket (e.g. "work on jira ticket PRO-234").

Both are generated from `mcps/jira/prompts/workflow.ts` by `plugins/build.ts` (`npm run build:plugins`) — edit the source prompt, not the generated files under `plugins/*/commands` and `plugins/*/skills`.

## Development

```bash
# Watch mode
npx tsc --watch

# Type check only
npx tsc --noEmit
```

## License

MIT
