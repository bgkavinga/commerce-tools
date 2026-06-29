import type { AgentConfig, IAgent } from '../providers/_base/agent.js';
import type { IProvider } from '../providers/_base/provider.js';
import type { Message, ToolUseContent } from '../providers/_base/types.js';

export abstract class BaseAgent implements IAgent {
  constructor(readonly config: AgentConfig) {}

  async run(messages: Message[], provider: IProvider): Promise<Message[]> {
    const history: Message[] = [...messages];
    const maxIterations = this.config.maxIterations ?? 10;

    for (let i = 0; i < maxIterations; i++) {
      const result = await provider.generate({
        model: this.config.model,
        messages: history,
        tools: this.config.tools,
        system: this.config.systemPrompt,
      });

      history.push({ role: 'assistant', content: result.content });

      if (result.stopReason !== 'tool_use') break;

      const toolUses = result.content.filter(
        (c): c is ToolUseContent => c.type === 'tool_use',
      );

      const toolResults = await Promise.all(
        toolUses.map(async (tu) => ({
          type: 'tool_result' as const,
          tool_use_id: tu.id,
          content: await this.handleToolCall(tu.name, tu.input),
        })),
      );

      history.push({ role: 'user', content: toolResults });
    }

    return history;
  }

  protected abstract handleToolCall(
    name: string,
    input: Record<string, unknown>,
  ): Promise<string>;
}
