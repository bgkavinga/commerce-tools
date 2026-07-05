import { useSettingsStore } from '../state/settingsStore';
import { useChatStore } from '../state/chatStore';
import './ChatWindow.css';
interface ChatWindowProps {
    threadId: string | null;
    onThreadIdChange: (id: string) => void;
    chatStore: ReturnType<typeof useChatStore>;
    settingsStore: ReturnType<typeof useSettingsStore>;
}
export default function ChatWindow({ threadId, onThreadIdChange, chatStore, settingsStore, }: ChatWindowProps): import("react").JSX.Element;
export {};
