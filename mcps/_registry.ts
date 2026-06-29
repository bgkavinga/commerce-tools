export interface McpServerEntry {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export const mcpRegistry: Record<string, McpServerEntry> = {
  newrelic: {
    name: 'newrelic-nrql',
    command: 'node',
    args: ['dist/mcps/newrelic/server.js'],
    env: {
      NEW_RELIC_API_KEY: process.env.NEW_RELIC_API_KEY ?? '',
      NEW_RELIC_REGION: process.env.NEW_RELIC_REGION ?? 'us',
    },
  },
};
