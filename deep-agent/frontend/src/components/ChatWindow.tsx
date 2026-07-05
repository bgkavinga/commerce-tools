import { useState, useRef, useEffect } from 'react'
import { streamChat } from '../api/client'
import { ChatRequest } from '../api/types'
import { useSettingsStore } from '../state/settingsStore'
import { useChatStore, MessageContent } from '../state/chatStore'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import './ChatWindow.css'

interface ChatWindowProps {
  threadId: string | null
  onThreadIdChange: (id: string) => void
  chatStore: ReturnType<typeof useChatStore>
  settingsStore: ReturnType<typeof useSettingsStore>
}

export default function ChatWindow({
  threadId,
  onThreadIdChange,
  chatStore,
  settingsStore,
}: ChatWindowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatStore.messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    setError(null)
    setIsLoading(true)

    try {
      // Add user message
      chatStore.addMessage('user', [{ type: 'text', text: message }])

      // Create assistant message that we'll update as we receive tokens
      const assistantContent: MessageContent[] = []
      chatStore.addMessage('assistant', assistantContent)

      const request: ChatRequest = {
        thread_id: threadId || undefined,
        message,
        provider: {
          key: settingsStore.settings.activeProviderKey,
          overrides: settingsStore.getOverrides(settingsStore.settings.activeProviderKey),
        },
      }

      let currentThreadId = threadId
      let tokenBuffer = ''

      await streamChat(request, {
        onThread: (event) => {
          currentThreadId = event.thread_id
          if (!threadId) {
            onThreadIdChange(event.thread_id)
          }
        },
        onToken: (event) => {
          tokenBuffer += event.content
          const newContent: MessageContent[] = [
            { type: 'text', text: tokenBuffer },
          ]
          chatStore.updateLastMessage(newContent)
        },
        onToolCall: (event) => {
          const newContent: MessageContent[] = [
            { type: 'text', text: tokenBuffer },
            {
              type: 'tool_call',
              toolId: event.id,
              toolName: event.name,
              toolArgs: event.args,
            },
          ]
          chatStore.updateLastMessage(newContent)
        },
        onToolResult: (event) => {
          const currentContent = chatStore.messages[chatStore.messages.length - 1]?.content || []
          const newContent: MessageContent[] = [
            ...currentContent,
            {
              type: 'tool_result',
              toolId: event.id,
              toolName: event.name,
              toolContent: event.content,
            },
          ]
          chatStore.updateLastMessage(newContent)
        },
        onError: (event) => {
          setError(event.message)
        },
        onDone: () => {
          // Message is complete
        },
      })
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-window">
      <MessageList messages={chatStore.messages} />
      <div ref={messagesEndRef} />
      {error && <div className="chat-error">{error}</div>}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}
