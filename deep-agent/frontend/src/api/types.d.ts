export interface CredentialField {
    name: string;
    label: string;
    type: 'text' | 'secret' | 'select';
    required: boolean;
    options?: string[];
    placeholder?: string;
    server_default_configured: boolean;
}
export interface ProviderSpec {
    key: string;
    label: string;
    default_model: string;
    fields: CredentialField[];
}
export interface ProvidersResponse {
    default_provider: string;
    providers: ProviderSpec[];
}
export interface ChatRequest {
    thread_id?: string | null;
    message: string;
    provider: {
        key: string;
        overrides: Record<string, string>;
    };
}
export interface ThreadEvent {
    thread_id: string;
}
export interface TokenEvent {
    content: string;
}
export interface ToolCall {
    id: string;
    name: string;
    args: Record<string, unknown>;
}
export interface ToolResult {
    id: string;
    name: string;
    content: string;
}
export interface ErrorEvent {
    message: string;
}
