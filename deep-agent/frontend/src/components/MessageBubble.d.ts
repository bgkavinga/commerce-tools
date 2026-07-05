import { ChatMessage } from '../state/chatStore';
import './MessageBubble.css';
interface MessageBubbleProps {
    message: ChatMessage;
}
export default function MessageBubble({ message }: MessageBubbleProps): import("react").JSX.Element;
export {};
