export type Role = 'user' | 'assistant' | 'system';

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultContent {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

export type MessageContent = TextContent | ToolUseContent | ToolResultContent;

export interface Message {
  role: Role;
  content: MessageContent | MessageContent[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface GenerateOptions {
  model: string;
  messages: Message[];
  tools?: ToolDefinition[];
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateResult {
  content: MessageContent[];
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
