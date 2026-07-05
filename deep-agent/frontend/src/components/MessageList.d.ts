import { ChatMessage } from '../state/chatStore';
import './MessageList.css';
interface MessageListProps {
    messages: ChatMessage[];
}
export default function MessageList({ messages }: MessageListProps): import("react").JSX.Element;
export {};
