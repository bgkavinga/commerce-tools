export type HookEvent = 'before-tool' | 'after-tool' | 'before-generate' | 'after-generate';
export type HookHandler = (event: HookEvent, payload: unknown) => Promise<void>;

const hooks = new Map<HookEvent, HookHandler[]>();

export function registerHook(event: HookEvent, handler: HookHandler): void {
  const list = hooks.get(event) ?? [];
  list.push(handler);
  hooks.set(event, list);
}

export async function emit(event: HookEvent, payload: unknown): Promise<void> {
  const list = hooks.get(event) ?? [];
  for (const handler of list) {
    await handler(event, payload);
  }
}
