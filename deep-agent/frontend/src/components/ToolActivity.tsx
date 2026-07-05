import './ToolActivity.css'

interface ToolActivityProps {
  type: 'call' | 'result'
  name: string
  args?: Record<string, unknown>
  content?: string
}

export default function ToolActivity({
  type,
  name,
  args,
  content,
}: ToolActivityProps) {
  return (
    <div className={`tool-activity tool-${type}`}>
      <div className="tool-header">
        <span className="tool-icon">{type === 'call' ? '🔧' : '✓'}</span>
        <span className="tool-name">{name}</span>
      </div>
      {type === 'call' && args && (
        <details className="tool-details">
          <summary>Arguments</summary>
          <pre className="tool-args">{JSON.stringify(args, null, 2)}</pre>
        </details>
      )}
      {type === 'result' && content && (
        <details className="tool-details">
          <summary>Result</summary>
          <div className="tool-result">{content}</div>
        </details>
      )}
    </div>
  )
}
