import { useSettingsStore } from '../state/settingsStore'
import ProviderSelector from './ProviderSelector'
import ProviderCredentialForm from './ProviderCredentialForm'
import './SettingsPanel.css'

interface SettingsPanelProps {
  settingsStore: ReturnType<typeof useSettingsStore>
}

export default function SettingsPanel({ settingsStore }: SettingsPanelProps) {
  if (!settingsStore.providers) {
    return <div className="settings-panel">Loading providers...</div>
  }

  const activeProvider = settingsStore.providers.providers.find(
    (p) => p.key === settingsStore.settings.activeProviderKey,
  )

  return (
    <div className="settings-panel">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>LLM Provider</h3>
        <ProviderSelector settingsStore={settingsStore} />
      </div>

      {activeProvider && (
        <div className="settings-section">
          <h3>{activeProvider.label} Configuration</h3>
          <ProviderCredentialForm
            provider={activeProvider}
            settingsStore={settingsStore}
          />
        </div>
      )}

      <div className="settings-footer">
        <p className="settings-hint">
          Credentials are stored locally in your browser and only sent with your chat messages.
        </p>
      </div>
    </div>
  )
}
