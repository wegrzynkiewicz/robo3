import { BinaryBYOBCodec } from "../../core/codec.ts";

export interface GAEnvelope<TData> {
  id: number;
  kind: string;
  params: TData;
}

export interface GABinaryEncodingDefinition<TData> {
  codec: BinaryBYOBCodec<TData>;
  type: "binary";
}

export interface GAJsonEncodingDefinition<TData> {
  type: "json";
}

export type GAEncodingDefinition<TData> = GABinaryEncodingDefinition<TData> | GAJsonEncodingDefinition<TData>;

export type AnyGAEnvelope = GAEnvelope<any>;

export interface GADefinition<TData> {
  encoding: GAEncodingDefinition<TData>;
  key: number;
  kind: string;
}

export type AnyGADefinition = GADefinition<any>;

export interface GAHandler<TRequest, TResponse> {
  handle(request: TRequest): Promise<TResponse>;
}

export type AnyGAHandler = GAHandler<any, any>;

export interface HandlerBinding<TRequest, TResponse> {
  handler: GAHandler<TRequest, TResponse>;
  request: GADefinition<TRequest>;
  response?: GADefinition<TResponse>;
}

export type AnyHandlerBinding = HandlerBinding<any, any>;

export interface GADispatcher {
  send<TData>(definition: GADefinition<TData>, data: TData): void;
  sendEnvelope<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): void;
}

export interface GARequestor {
  request<TRequest, TResponse>(
    requestDefinition: GADefinition<TRequest>,
    responseDefinition: GADefinition<TResponse>,
    data: TRequest,
  ): Promise<TResponse>;
}

export interface GAReceiver {
  receive(data: unknown): Promise<void>;
}
