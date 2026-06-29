import type { GenerateOptions, GenerateResult } from './types.js';

export interface IProvider {
  readonly name: string;
  generate(options: GenerateOptions): Promise<GenerateResult>;
}
