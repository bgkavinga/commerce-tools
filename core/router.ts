import type { IProvider } from '../providers/_base/provider.js';

const providers = new Map<string, IProvider>();

export function registerProvider(provider: IProvider): void {
  providers.set(provider.name, provider);
}

export function resolveProvider(name?: string): IProvider {
  const target = name ?? process.env.AI_PROVIDER ?? 'claude';
  const provider = providers.get(target);
  if (!provider) {
    throw new Error(
      `Unknown provider "${target}". Registered: ${[...providers.keys()].join(', ')}`,
    );
  }
  return provider;
}
