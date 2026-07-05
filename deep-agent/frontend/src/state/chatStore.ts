import { useState, useEffect } from 'react'

export interface MessageContent {
  type: 'text' | 'tool_call' | 'tool_result'
  text?: string
  toolId?: string
  toolName?: string
  toolArgs?: Record<string, unknown>
  toolContent?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: MessageContent[]
  timestamp: number
}

export function useChatStore(threadId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const storageKey = threadId ? `deepagent.thread.${threadId}.messages` : null

  // Load messages from localStorage if we have a thread ID
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          setMessages(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse saved messages:', e)
        }
      }
    }
  }, [storageKey])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    }
  }, [messages, storageKey])

  const addMessage = (role: 'user' | 'assistant', content: MessageContent[]) => {
    const message: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role,
      content,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, message])
    return message
  }

  const updateLastMessage = (content: MessageContent[]) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      return [
        ...prev.slice(0, -1),
        {
          ...prev[prev.length - 1],
          content,
        },
      ]
    })
  }

  const clear = () => {
    setMessages([])
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
  }

  return { messages, addMessage, updateLastMessage, clear }
}
