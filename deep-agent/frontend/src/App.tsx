import { useState, useEffect } from 'react'
import { fetchProviders } from './api/client'
import { useSettingsStore } from './state/settingsStore'
import { useChatStore } from './state/chatStore'
import ChatWindow from './components/ChatWindow'
import SettingsPanel from './components/SettingsPanel'
import './App.css'

function App() {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const settingsStore = useSettingsStore()
  const chatStore = useChatStore(threadId)

  // Load providers on mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await fetchProviders()
        settingsStore.setProviders(providers)

        // Set default provider if not already set
        if (!settingsStore.settings.activeProviderKey && providers.default_provider) {
          settingsStore.setActiveProvider(providers.default_provider)
        }
      } catch (e) {
        setError(`Failed to load providers: ${e instanceof Error ? e.message : String(e)}`)
      } finally {
        setLoading(false)
      }
    }

    loadProviders()
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Deep Agent</h1>
        <button
          className="settings-button"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          ⚙️
        </button>
      </header>

      <main className="app-main">
        <ChatWindow
          threadId={threadId}
          onThreadIdChange={setThreadId}
          chatStore={chatStore}
          settingsStore={settingsStore}
        />
        {showSettings && (
          <SettingsPanel settingsStore={settingsStore} />
        )}
      </main>
    </div>
  )
}

export default App
