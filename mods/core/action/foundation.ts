import { registerService } from "../dependency/service.ts";

export interface GABinaryCodec<TParams> {
  calcBufferSize(params: TParams): number;
  decode(buffer: ArrayBuffer, byteOffset: number): TParams;
  encode(buffer: ArrayBuffer, byteOffset: number, params: TParams): void;
}

export interface GAJsonCodec<TParams> {
  decode(data: Record<string, unknown>): TParams;
  encode?: (data: TParams) => Record<string, unknown>;
}
export type UnknownGACodec = GABinaryCodec<Record<string, unknown>>;

export interface GABinaryMessageConfig<TData> {
  type: 'binary';
  codec: GABinaryCodec<TData>;
}

export interface GATextMessageConfig<TData> {
  type: 'json';
  codec: GAJsonCodec<TData>;
}

export type GAMessageConfig<TData> = GABinaryMessageConfig<TData> | GATextMessageConfig<TData>

export interface GAConversation<TRequest, TResponse> {
  code: string;
  index: number;
  type: 'conversation',
  request: GAMessageConfig<TRequest>;
  response: GAMessageConfig<TResponse>;
}

export interface GANotification<TNotification> {
  code: string,
  index: number;
  notify: GAMessageConfig<TNotification>;
  type: 'notification',
}

export type GADefinition = GAConversation<any, any> | GANotification<any>;

export interface GACommon {
  code: string;
  id: number;
  params: Record<string, unknown>;
}

export interface GARequest extends GACommon {
  kind: "req";
}

export interface GANotify extends GACommon {
  kind: "not";
}

export interface GAError extends GACommon {
  kind: "err";
}

export interface GAResponse extends GACommon {
  kind: "res";
}

export type GAEnvelope = GAError | GANotify | GARequest | GAResponse;
export type GAKind = GAEnvelope["kind"];
export type GAResult = GAResponse | GAError;

export class GAManager {
  protected currentIndex = 1;
  public readonly byIndex = new Map<number, GADefinition>();
  public readonly byKey = new Map<string, GADefinition>();

  protected registerGADefinition(definition: GADefinition) {
    const { code, index } = definition;
    this.byIndex.set(index, definition);
    this.byKey.set(code, definition);
  }

  public registerGAConversation<TRequest, TResponse>(
    definition: GAConversation<TRequest, TResponse>
  ): GAConversation<TRequest, TResponse> {
    this.registerGADefinition(definition);
    return definition;
  }

  public registerGANotification<TNotification>(
    definition: GANotification<TNotification>
  ): GANotification<TNotification> {
    this.registerGADefinition(definition);
    return definition;
  }
}

const manager = new GAManager();
export const registerGAConversation = manager.registerGAConversation.bind(manager);
export const registerGANotification = manager.registerGANotification.bind(manager);

export const gaManager = registerService({
  provider: async () => (manager),
  singleton: true,
});
