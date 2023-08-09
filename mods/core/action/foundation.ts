import { registerService } from "../dependency/service.ts";
import { GACodec } from "./codec.ts";

export interface GAConversation<TRequest, TResponse> {
  code: string;
  index: number;
  type: 'conversation',
  request: GACodec<TRequest>;
  response: GACodec<TResponse>;
}

export interface GANotification<TNotification> {
  code: string,
  index: number;
  notify: GACodec<TNotification>;
  type: 'notification',
}

export type GADefinition = GAConversation<any, any> | GANotification<any>;

export type GAKind = "err" | "not" | "req" | "res";

export interface GAHeader {
  code: string;
  id: number;
  kind: GAKind;
}

export interface GAEnvelope<TData> extends GAHeader {
  params: TData;
}

export class GAManager {
  protected currentIndex = 1;
  public readonly byCode = new Map<string, GADefinition>();
  public readonly byIndex = new Map<number, GADefinition>();

  public registerGADefinition<TDefinition extends GADefinition>(definition: TDefinition): TDefinition {
    const { code, index } = definition;
    this.byCode.set(code, definition);
    this.byIndex.set(index, definition);
    return definition;
  }
}

const manager = new GAManager();
export const registerGADefinition = manager.registerGADefinition.bind(manager);

export const gaManager = registerService({
  provider: async () => (manager),
  singleton: true,
});
