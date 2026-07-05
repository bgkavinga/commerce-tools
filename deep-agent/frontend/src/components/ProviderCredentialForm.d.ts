import { ProviderSpec } from '../api/types';
import { useSettingsStore } from '../state/settingsStore';
import './ProviderCredentialForm.css';
interface ProviderCredentialFormProps {
    provider: ProviderSpec;
    settingsStore: ReturnType<typeof useSettingsStore>;
}
export default function ProviderCredentialForm({ provider, settingsStore, }: ProviderCredentialFormProps): import("react").JSX.Element;
export {};
