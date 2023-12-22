export interface JADefinition<TData> {
  kind: string;
}
export type AnyJADefinition = JADefinition<any>;

export interface JAEnvelope<TData> {
  id: number;
  kind: string;
  params: TData;
}
export type AnyJAEnvelope = JAEnvelope<any>;

export interface JAHandler<TData> {
  handle(data: TData): Promise<void>;
}
export type AnyJAHandler = JAHandler<any>;

export interface JAHandlerBinding<TData> {
  definition: JADefinition<TData>;
  handler: JAHandler<TData>;
}
export type AnyJAHandlerBinding = JAHandlerBinding<any>;
