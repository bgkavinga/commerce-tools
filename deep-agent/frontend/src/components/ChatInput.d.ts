import './ChatInput.css';
interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}
export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps): import("react").JSX.Element;
export {};
