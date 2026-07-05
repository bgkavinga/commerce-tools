import { ProviderSpec } from '../api/types'
import { useSettingsStore } from '../state/settingsStore'
import './ProviderCredentialForm.css'

interface ProviderCredentialFormProps {
  provider: ProviderSpec
  settingsStore: ReturnType<typeof useSettingsStore>
}

export default function ProviderCredentialForm({
  provider,
  settingsStore,
}: ProviderCredentialFormProps) {
  const overrides = settingsStore.getOverrides(provider.key)

  return (
    <div className="credential-form">
      {provider.fields.map((field) => {
        const value = overrides[field.name] || ''
        const hasServerDefault = field.server_default_configured

        return (
          <div key={field.name} className="form-group">
            <label htmlFor={`${provider.key}-${field.name}`}>
              {field.label}
              {field.required && <span className="required">*</span>}
              {hasServerDefault && !value && (
                <span className="server-default-badge">server</span>
              )}
            </label>

            {field.type === 'secret' ? (
              <input
                id={`${provider.key}-${field.name}`}
                type="password"
                placeholder={
                  hasServerDefault && !value
                    ? 'Using server default'
                    : field.placeholder || 'Enter value...'
                }
                value={value}
                onChange={(e) =>
                  settingsStore.setOverride(provider.key, field.name, e.target.value)
                }
              />
            ) : field.type === 'select' && field.options ? (
              <select
                id={`${provider.key}-${field.name}`}
                value={value}
                onChange={(e) =>
                  settingsStore.setOverride(provider.key, field.name, e.target.value)
                }
              >
                <option value="">
                  {hasServerDefault ? 'Server default' : 'Select...'}
                </option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`${provider.key}-${field.name}`}
                type="text"
                placeholder={
                  hasServerDefault && !value
                    ? 'Using server default'
                    : field.placeholder || 'Enter value...'
                }
                value={value}
                onChange={(e) =>
                  settingsStore.setOverride(provider.key, field.name, e.target.value)
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
