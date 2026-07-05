import { ChatMessage } from '../state/chatStore'
import ToolActivity from './ToolActivity'
import './MessageBubble.css'

interface MessageBubbleProps {
  message: ChatMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`message-bubble message-${message.role}`}>
      {message.content.map((content, idx) => {
        switch (content.type) {
          case 'text':
            return (
              <div key={idx} className="message-text">
                {content.text}
              </div>
            )
          case 'tool_call':
            return (
              <ToolActivity
                key={idx}
                type="call"
                name={content.toolName || ''}
                args={content.toolArgs}
              />
            )
          case 'tool_result':
            return (
              <ToolActivity
                key={idx}
                type="result"
                name={content.toolName || ''}
                content={content.toolContent}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
