import { ProvidersResponse, ChatRequest, ThreadEvent, TokenEvent, ToolCall, ToolResult, ErrorEvent } from './types.js';
export declare function fetchProviders(): Promise<ProvidersResponse>;
export interface StreamCallbacks {
    onThread?: (event: ThreadEvent) => void;
    onToken?: (event: TokenEvent) => void;
    onToolCall?: (event: ToolCall) => void;
    onToolResult?: (event: ToolResult) => void;
    onError?: (event: ErrorEvent) => void;
    onDone?: () => void;
}
export declare function streamChat(request: ChatRequest, callbacks: StreamCallbacks): Promise<void>;
