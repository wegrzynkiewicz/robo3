export interface GADefinition<TData> {
  kind: string;
}
export type AnyGADefinition = GADefinition<any>;

export interface GAEnvelope<TData> {
  id: number;
  kind: string;
  params: TData;
}
export type AnyGAEnvelope = GAEnvelope<any>;

export interface GAHandler<TData> {
  handle(data: TData): Promise<void>;
}
export type AnyGAHandler = GAHandler<any>;

export interface GAHandlerBinding<TData> {
  definition: GADefinition<TData>;
  handler: GAHandler<TData>;
}
export type AnyGAHandlerBinding = GAHandlerBinding<any>;
