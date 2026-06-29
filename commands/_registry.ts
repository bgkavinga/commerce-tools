export interface Command {
  name: string;
  description: string;
  run(args: string[]): Promise<void>;
}

const registry = new Map<string, Command>();

export function registerCommand(command: Command): void {
  registry.set(command.name, command);
}

export function getCommand(name: string): Command | undefined {
  return registry.get(name);
}

export function listCommands(): Command[] {
  return Array.from(registry.values());
}
