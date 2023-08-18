import { isRequiredString, Breaker, assertObject } from "../../common/asserts.ts";
import { registerService } from "../dependency/service.ts";
import { GACodec, GAEnvelope, decodeGAJsonEnvelope } from "./codec.ts";

export interface GADefinition<TData> {
  codec: GACodec<TData>,
  key: number;
  kind: string;
}

export type AnyGADefinition = GADefinition<any>;

export class GAManager {
  public readonly byKey = new Map<number, AnyGADefinition>();
  public readonly byKind = new Map<string, AnyGADefinition>();

  public registerGADefinition<TDefinition extends AnyGADefinition>(definition: TDefinition): TDefinition {
    const { key, kind } = definition;
    this.byKey.set(key, definition);
    this.byKind.set(kind, definition);
    return definition;
  }

  public decode<TData>(message: unknown): [GADefinition<TData>, GAEnvelope<TData>] {
    if (isRequiredString(message)) {
      const data = decodeGAJsonEnvelope(message);
      const { kind } = data;
      const definition = this.byKind.get(kind);
      assertObject(definition, "cannot-decode-envelope-with-unknown-kind", { definition, kind });
      const envelope = definition.codec.decode(data);
      return [definition, envelope];
    } else if (message instanceof ArrayBuffer) {
      const dv = new DataView(message);
      const key = dv.getUint32(0, false);
      const definition = this.byKey.get(key);
      assertObject(definition, "cannot-decode-envelope-with-unknown-key", { definition, key });
      const envelope = definition.codec.decode(message);
      return [definition, envelope];
    } else {
      throw new Breaker("unexpected-game-action-communication-message");
    }
  }
}

const manager = new GAManager();
export const registerGADefinition = manager.registerGADefinition.bind(manager);

export const gaManagerService = registerService({
  provider: async () => (manager),
  singleton: true,
});
