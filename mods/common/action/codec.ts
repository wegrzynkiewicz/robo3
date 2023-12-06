import { assertObject, assertPositiveNumber, assertRequiredString, isRequiredString } from "../../utils/asserts.ts";
import { Breaker } from "../../utils/breaker.ts";
import { BinaryBYOBCodec } from "../../core/codec.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { GADefinition, GAManager, provideGAManager } from "./foundation.ts";

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

export const GA_BINARY_HEADER_BYTE_LENGTH = 4;

export const gaBinaryHeaderCodec: BinaryBYOBCodec<GABinaryHeader> = {
  calcByteLength(): number {
    return GA_BINARY_HEADER_BYTE_LENGTH;
  },
  decode: function (buffer: ArrayBuffer, byteOffset: number): GABinaryHeader {
    const dv = new DataView(buffer, byteOffset);
    const key = dv.getUint16(0, true);
    const id = dv.getUint16(2, true);
    return { key, id };
  },
  encode: function (buffer: ArrayBuffer, byteOffset: number, data: GABinaryHeader): void {
    const { id, key } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setUint16(0, key, true);
    dv.setUint16(2, id, true);
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
      const { id, key } = gaBinaryHeaderCodec.decode(message, 0);
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

export function provideGACodec(resolver: ServiceResolver): GACodec {
  return new GACodec(
    resolver.resolve(provideGAManager),
  );
}
