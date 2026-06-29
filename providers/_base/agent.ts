import type { IProvider } from './provider.js';
import type { Message, ToolDefinition } from './types.js';

export interface AgentConfig {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  tools?: ToolDefinition[];
  maxIterations?: number;
}

export interface IAgent {
  readonly config: AgentConfig;
  run(messages: Message[], provider: IProvider): Promise<Message[]>;
}
