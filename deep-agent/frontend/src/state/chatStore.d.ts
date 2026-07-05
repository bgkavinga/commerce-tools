export interface MessageContent {
    type: 'text' | 'tool_call' | 'tool_result';
    text?: string;
    toolId?: string;
    toolName?: string;
    toolArgs?: Record<string, unknown>;
    toolContent?: string;
}
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: MessageContent[];
    timestamp: number;
}
export declare function useChatStore(threadId: string | null): {
    messages: ChatMessage[];
    addMessage: (role: "user" | "assistant", content: MessageContent[]) => ChatMessage;
    updateLastMessage: (content: MessageContent[]) => void;
    clear: () => void;
};
