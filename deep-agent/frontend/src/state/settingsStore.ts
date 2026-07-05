import { useState, useEffect } from 'react'
import { ProvidersResponse } from '../api/types.js'

const SETTINGS_KEY = 'deepagent.settings.v1'

export interface Settings {
  activeProviderKey: string
  overridesByProvider: Record<string, Record<string, string>>
}

export function useSettingsStore() {
  const [providers, setProviders] = useState<ProvidersResponse | null>(null)
  const [settings, setSettingsState] = useState<Settings>({
    activeProviderKey: 'anthropic',
    overridesByProvider: {},
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      try {
        setSettingsState(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved settings:', e)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  const setActiveProvider = (key: string) => {
    setSettingsState((prev) => ({
      ...prev,
      activeProviderKey: key,
    }))
  }

  const setOverride = (providerKey: string, field: string, value: string) => {
    setSettingsState((prev) => ({
      ...prev,
      overridesByProvider: {
        ...prev.overridesByProvider,
        [providerKey]: {
          ...prev.overridesByProvider[providerKey],
          [field]: value,
        },
      },
    }))
  }

  const getOverrides = (providerKey: string): Record<string, string> => {
    return settings.overridesByProvider[providerKey] || {}
  }

  return {
    providers,
    setProviders,
    settings,
    setActiveProvider,
    setOverride,
    getOverrides,
  }
}
