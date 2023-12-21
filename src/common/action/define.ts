import { BinaryBYOBCodec } from "../../core/codec.ts";

export interface CAEnvelope<TData> {
  id: number;
  kind: string;
  params: TData;
}

export interface CABinaryEncodingDefinition<TData> {
  codec: BinaryBYOBCodec<TData>;
  key: number;
  type: "binary";
}

export interface CAJsonEncodingDefinition<TData> {
  type: "json";
}

export type CAEncodingDefinition<TData> = CABinaryEncodingDefinition<TData> | CAJsonEncodingDefinition<TData>;

export type AnyCAEnvelope = CAEnvelope<any>;

export interface CADefinition<TData> {
  encoding: CAEncodingDefinition<TData>;
  kind: string;
}

export type AnyCADefinition = CADefinition<any>;

export interface CAHandler<TRequest, TResponse> {
  handle(request: TRequest): Promise<TResponse>;
}

export type AnyCAHandler = CAHandler<any, any>;

export interface HandlerBinding<TRequest, TResponse> {
  handler: CAHandler<TRequest, TResponse>;
  request: CADefinition<TRequest>;
  response?: CADefinition<TResponse>;
}

export type AnyHandlerBinding = HandlerBinding<any, any>;

export interface CADispatcher {
  send<TData>(definition: CADefinition<TData>, data: TData): void;
  sendEnvelope<TData>(definition: CADefinition<TData>, envelope: CAEnvelope<TData>): void;
}

export interface CARequestor {
  request<TRequest, TResponse>(
    requestDefinition: CADefinition<TRequest>,
    responseDefinition: CADefinition<TResponse>,
    data: TRequest,
  ): Promise<TResponse>;
}

export interface CAReceiver {
  receive(data: unknown): Promise<void>;
}
