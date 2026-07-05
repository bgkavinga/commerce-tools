import {
  ProvidersResponse,
  ChatRequest,
  ThreadEvent,
  TokenEvent,
  ToolCall,
  ToolResult,
  ErrorEvent,
} from './types.js'

export async function fetchProviders(): Promise<ProvidersResponse> {
  const response = await fetch('/api/providers')
  if (!response.ok) {
    throw new Error(`Failed to fetch providers: ${response.statusText}`)
  }
  return response.json()
}

export interface StreamCallbacks {
  onThread?: (event: ThreadEvent) => void
  onToken?: (event: TokenEvent) => void
  onToolCall?: (event: ToolCall) => void
  onToolResult?: (event: ToolResult) => void
  onError?: (event: ErrorEvent) => void
  onDone?: () => void
}

export async function streamChat(
  request: ChatRequest,
  callbacks: StreamCallbacks,
): Promise<void> {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || `Chat request failed: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Parse complete SSE frames
      const frames = buffer.split('\n\n')
      buffer = frames.pop() || '' // Keep incomplete frame in buffer

      for (const frame of frames) {
        if (!frame.trim()) continue

        const lines = frame.split('\n')
        let eventType = ''
        let data = ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7)
          } else if (line.startsWith('data: ')) {
            data = line.slice(6)
          }
        }

        if (!eventType || !data) continue

        try {
          const parsed = JSON.parse(data)

          switch (eventType) {
            case 'thread':
              callbacks.onThread?.(parsed as ThreadEvent)
              break
            case 'token':
              callbacks.onToken?.(parsed as TokenEvent)
              break
            case 'tool_call':
              callbacks.onToolCall?.(parsed as ToolCall)
              break
            case 'tool_result':
              callbacks.onToolResult?.(parsed as ToolResult)
              break
            case 'error':
              callbacks.onError?.(parsed as ErrorEvent)
              break
            case 'done':
              callbacks.onDone?.()
              break
          }
        } catch (e) {
          console.error('Failed to parse SSE frame:', frame, e)
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.trim()) {
      const lines = buffer.split('\n')
      let eventType = ''
      let data = ''

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          eventType = line.slice(7)
        } else if (line.startsWith('data: ')) {
          data = line.slice(6)
        }
      }

      if (eventType && data) {
        try {
          const parsed = JSON.parse(data)
          if (eventType === 'done') {
            callbacks.onDone?.()
          }
        } catch (e) {
          console.error('Failed to parse final SSE frame:', buffer, e)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
