import { useSettingsStore } from '../state/settingsStore'
import './ProviderSelector.css'

interface ProviderSelectorProps {
  settingsStore: ReturnType<typeof useSettingsStore>
}

export default function ProviderSelector({ settingsStore }: ProviderSelectorProps) {
  if (!settingsStore.providers) {
    return <div>Loading...</div>
  }

  return (
    <div className="provider-selector">
      {settingsStore.providers.providers.map((provider) => (
        <label key={provider.key} className="provider-option">
          <input
            type="radio"
            name="provider"
            value={provider.key}
            checked={settingsStore.settings.activeProviderKey === provider.key}
            onChange={() => settingsStore.setActiveProvider(provider.key)}
          />
          <span className="provider-label">{provider.label}</span>
        </label>
      ))}
    </div>
  )
}
