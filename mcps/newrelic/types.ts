export interface Tag {
  key: string;
  values: string[];
}

export interface Entity {
  accountId: number;
  guid: string;
  name: string;
  tags: Tag[];
}

export interface EntitySearchResult {
  found: boolean;
  count?: number;
  message?: string;
  entities: Entity[];
}
