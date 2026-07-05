import { useSettingsStore } from '../state/settingsStore';
import './ProviderSelector.css';
interface ProviderSelectorProps {
    settingsStore: ReturnType<typeof useSettingsStore>;
}
export default function ProviderSelector({ settingsStore }: ProviderSelectorProps): import("react").JSX.Element;
export {};
