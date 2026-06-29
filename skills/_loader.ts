export interface Skill {
  name: string;
  description: string;
  invoke(args: string): Promise<string>;
}

const registry = new Map<string, Skill>();

export function registerSkill(skill: Skill): void {
  registry.set(skill.name, skill);
}

export function getSkill(name: string): Skill | undefined {
  return registry.get(name);
}

export function listSkills(): Skill[] {
  return Array.from(registry.values());
}
