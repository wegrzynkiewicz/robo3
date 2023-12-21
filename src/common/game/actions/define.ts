export interface GADefinition<TData> {
  kind: string;
}

export type AnyGADefinition = GADefinition<any>;

export interface GAHandler<TData> {
  handle(data: TData): Promise<void>;
}
