# commerce-tools

A modular AI tooling platform for Adobe Commerce operations, monitoring, and security analysis. Provides a New Relic MCP server for NRQL query execution, plus a composable framework of agents, skills, commands, and providers for building AI-powered Commerce workflows.

## Features

- **New Relic MCP Server** — executes NRQL queries via NerdGraph and maps Adobe Commerce project IDs to New Relic account IDs
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
├── mcps/          # MCP servers (New Relic NRQL)
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

## Using with Claude Code

The `.mcp.json` file configures the New Relic MCP server for use with Claude Code. To register it:

```bash
claude mcp add newrelic -- node /path/to/commerce-tools/dist/mcps/newrelic/server.js
```

Or reference the existing `.mcp.json` in your Claude Code project settings. Once connected, Claude can:

- Run NRQL queries against any New Relic account
- Resolve Adobe Commerce project IDs to account IDs
- Analyze logs, transactions, APM metrics, Redis, MySQL, and Elasticsearch data
- Detect and investigate security attacks

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

## Development

```bash
# Watch mode
npx tsc --watch

# Type check only
npx tsc --noEmit
```

## License

Private — Adobe internal tooling.
