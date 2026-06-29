export type ToolHandler = (input: Record<string, unknown>) => Promise<string>;

const handlers = new Map<string, ToolHandler>();

export function registerTool(name: string, handler: ToolHandler): void {
  handlers.set(name, handler);
}

export async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  const handler = handlers.get(name);
  if (!handler) throw new Error(`No handler registered for tool "${name}"`);
  return handler(input);
}
