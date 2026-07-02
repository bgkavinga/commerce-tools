# newrelic-nrql — Cursor plugin

An installable [Cursor plugin](https://cursor.com/docs/reference/plugins) that bundles the New Relic NRQL capability of `@kavinga/commerce-tools` as a Cursor **skill + agent + command + MCP server**.

## Contents

| Path | Component | Purpose |
|---|---|---|
| `.cursor-plugin/plugin.json` | Manifest | Plugin name, version, description |
| `skills/newrelic-commerce/SKILL.md` | Skill | NRQL specialist for Adobe Commerce querying |
| `agents/newrelic-security.md` | Agent | Security analyst (attack detection via NRQL) |
| `commands/nrql.md` | Command | `/nrql <query>` — run an ad-hoc NRQL query |
| `mcp.json` | MCP server | Wires up the `newrelic` MCP server (`execute_nrql`, `get_account_id_by_project_id`) |

The MCP server is launched via `npx` from the published `@kavinga/commerce-tools` package, so installing the plugin needs no local build.

## Generated — do not edit by hand

Every file in this directory (except this README) is **generated** by
[`build.ts`](build.ts) from the canonical sources to avoid duplicated content:

- Skill / agent prompts come from [`mcps/newrelic/prompts`](../../mcps/newrelic/prompts)
  (the same strings the MCP server registers as prompts).
- `mcp.json` is derived from the repo's [`.mcp.json`](../../.mcp.json).
- `plugin.json` metadata is derived from the repo's [`package.json`](../../package.json).

Regenerate after changing any of those sources:

```bash
npm run build:plugin:cursor   # or `npm run build`, which runs it too
```

## Install

Point Cursor at this directory (Customize → Plugins → install from path), or publish
it to the Cursor plugin marketplace. Set `NEW_RELIC_API_KEY` (and optionally
`NEW_RELIC_REGION`, `NEW_RELIC_ACCOUNT_ID`) in the MCP server env.
