import { assertObject, assertPositiveNumber, assertRequiredString, Breaker, isRequiredString } from "../../common/asserts.ts";
import { BinaryBYOBCodec } from "../codec.ts";
import { registerService, ServiceResolver } from "../dependency/service.ts";
import { GADefinition, GAManager, gaManagerService } from "./foundation.ts";

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

export function decodeGAJsonEnvelope(message: string): AnyGAEnvelope {
  const envelope = JSON.parse(message);
  assertObject<AnyGAEnvelope>(envelope, "invalid-game-action-envelope");
  const { id, kind, params } = envelope;
  assertPositiveNumber(id, "invalid-game-action-envelope-id");
  assertRequiredString(kind, "invalid-game-action-envelope-kind");
  assertObject(params, "invalid-game-action-envelope-params");
  return { id, kind, params };
}

export interface GABinaryHeader {
  readonly key: number;
  readonly id: number;
}

export const GA_BINARY_HEADER_BYTE_LENGTH = 8;

export const gaBinaryHeaderCodec: BinaryBYOBCodec<GABinaryHeader> = {
  calcByteLength(): number {
    return GA_BINARY_HEADER_BYTE_LENGTH;
  },
  decode: function (buffer: ArrayBuffer, byteOffset: number): GABinaryHeader {
    const dv = new DataView(buffer, byteOffset);
    const key = dv.getUint32(0, true);
    const id = dv.getUint32(4, true);
    return { key, id };
  },
  encode: function (buffer: ArrayBuffer, byteOffset: number, data: GABinaryHeader): void {
    const { id, key } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setUint32(0, key, true);
    dv.setUint32(4, id, true);
  },
};

export class GACodec {
  public constructor(
    public manager: GAManager,
  ) {}

  public decode<TData>(message: unknown): [GADefinition<TData>, GAEnvelope<TData>] {
    if (isRequiredString(message)) {
      const envelope = decodeGAJsonEnvelope(message);
      const { kind } = envelope;
      const definition = this.manager.byKind.get(kind);
      assertObject(definition, "cannot-decode-envelope-with-unknown-kind", { definition, kind });
      const { type } = definition.encoding;
      if (type !== "json") {
        throw new Breaker("unexpected-game-action-encoding-type", { definition, type });
      }
      return [definition, envelope];
    } else if (message instanceof ArrayBuffer) {
      const dv = new DataView(message);
      const key = dv.getUint32(0, true);
      const id = dv.getUint32(4, true);
      const definition = this.manager.byKey.get(key);
      assertObject(definition, "cannot-decode-envelope-with-unknown-key", { definition, key });
      const { encoding, kind } = definition;
      const type = encoding.type;
      if (type !== "binary") {
        throw new Breaker("unexpected-game-action-encoding-type", { definition, type });
      }
      const params = encoding.codec.decode(message, GA_BINARY_HEADER_BYTE_LENGTH);
      const envelope: GAEnvelope<TData> = { id, kind, params };
      return [definition, envelope];
    } else {
      throw new Breaker("unexpected-game-action-communication-message");
    }
  }

  public encode<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): string | ArrayBuffer {
    const { encoding, key } = definition;
    const type = encoding.type;
    if (type === "json") {
      const data = JSON.stringify(envelope);
      return data;
    } else if (type === "binary") {
      const { id, params } = envelope;
      const byteLength = GA_BINARY_HEADER_BYTE_LENGTH + encoding.codec.calcByteLength(params);
      const buffer = new ArrayBuffer(byteLength);
      gaBinaryHeaderCodec.encode(buffer, 0, { id, key });
      encoding.codec.encode(buffer, GA_BINARY_HEADER_BYTE_LENGTH, params);
      return buffer;
    } else {
      throw new Breaker("unexpected-game-action-definition");
    }
  }
}

export const gaCodecService = registerService({
  provider: async (resolver: ServiceResolver): Promise<GACodec> => {
    const manager = await resolver.resolve(gaManagerService);
    return new GACodec(manager);
  },
});
