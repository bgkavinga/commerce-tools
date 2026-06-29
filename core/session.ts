import type { Message } from '../providers/_base/types.js';

export interface Session {
  id: string;
  provider: string;
  messages: Message[];
  createdAt: Date;
}

export function createSession(provider: string): Session {
  return {
    id: crypto.randomUUID(),
    provider,
    messages: [],
    createdAt: new Date(),
  };
}

export function appendMessage(session: Session, message: Message): void {
  session.messages.push(message);
}
