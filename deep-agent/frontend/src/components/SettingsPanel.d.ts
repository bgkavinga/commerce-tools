import { useSettingsStore } from '../state/settingsStore';
import './SettingsPanel.css';
interface SettingsPanelProps {
    settingsStore: ReturnType<typeof useSettingsStore>;
}
export default function SettingsPanel({ settingsStore }: SettingsPanelProps): import("react").JSX.Element;
export {};
