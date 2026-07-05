# adobe-commerce-tools — Claude Code & Cursor plugins

Installable plugins that bundle the New Relic NRQL and Jira triage capabilities
of `@kavinga/commerce-tools` for [Claude Code](https://docs.anthropic.com/en/docs/claude-code/plugins)
(`plugins/claude/`) and [Cursor](https://cursor.com/docs/reference/plugins)
(`plugins/cursor/`). Both trees ship the same components:

| Path (per tree) | Component | Why this entity type |
|---|---|---|
| `skills/newrelic-commerce/SKILL.md` | **Skill** | Reference knowledge (entity → filter table, field-discovery rules) that the model loads on demand when writing NRQL for Adobe Commerce. |
| `agents/newrelic-security.md` | **Agent** | Multi-step attack investigation runs many discovery/aggregation queries; a subagent keeps that noise in an isolated context and returns only the findings. |
| `commands/nrql.md` | **Command** | `/nrql <query>` — explicit, user-triggered, parameterized entry point for ad-hoc queries. |
| `skills/jira-newrelic-triage/SKILL.md` | **Skill** | Reference knowledge for chaining a Jira ticket into a New Relic investigation; triggers on ticket-key mentions or "work on"/"investigate" phrasing. |
| `commands/work-on-ticket.md` | **Command** | `/work-on-ticket <issue-key>` — explicit, user-triggered entry point that fetches a Jira ticket and investigates it with New Relic. |
| `.mcp.json` (Claude) / `mcp.json` (Cursor) | MCP servers | Wires up the `newrelic` MCP server (`execute_nrql`, `get_account_id_by_project_id`) and the `jira` MCP server (`get_jira_issue`). |
| `.claude-plugin/plugin.json` / `.cursor-plugin/plugin.json` | Manifest | Plugin name, version, description — kept in sync with the marketplace manifests at the repo root. |

Both MCP servers are launched via `npx` from the published
`@kavinga/commerce-tools` package, so installing a plugin needs no local build.

## Generated — do not edit by hand

Every file under `plugins/claude/` and `plugins/cursor/` is **generated** by
[`build.ts`](build.ts) from the canonical sources, so the two trees and the MCP
servers never drift apart:

- Skill / agent / triage prompts come from [`mcps/newrelic/prompts`](../mcps/newrelic/prompts)
  and [`mcps/jira/prompts`](../mcps/jira/prompts) (the same strings the MCP
  servers register as prompts).
- MCP config is derived from the repo's [`.mcp.json`](../.mcp.json), with env
  values replaced by `${VAR}` interpolation.
- `plugin.json` version comes from the repo's [`package.json`](../package.json);
  the plugin name must match the `.claude-plugin/marketplace.json` and
  `.cursor-plugin/marketplace.json` entries at the repo root.

Regenerate after changing any of those sources:

```bash
npm run build:plugins   # or `npm run build`, which runs it too
```

## Install

- **Claude Code:** add this repo as a marketplace (`/plugin marketplace add <repo>`)
  and install `adobe-commerce-tools`, or point at `plugins/claude` directly.
- **Cursor:** Customize → Plugins → install from path, pointing at `plugins/cursor`,
  or publish to the Cursor plugin marketplace.

Set `NEW_RELIC_API_KEY` (and optionally `NEW_RELIC_REGION`,
`NEW_RELIC_ACCOUNT_ID`) and `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` in
your environment; the MCP server config reads them via `${VAR}` interpolation.
