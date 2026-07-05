import './ToolActivity.css';
interface ToolActivityProps {
    type: 'call' | 'result';
    name: string;
    args?: Record<string, unknown>;
    content?: string;
}
export default function ToolActivity({ type, name, args, content, }: ToolActivityProps): import("react").JSX.Element;
export {};
