export interface SADefinition<TData> {
  kind: string;
}

export type AnySADefinition = SADefinition<any>;

export interface SAHandler<TData> {
  handle(data: TData): Promise<void>;
}
