import { assertObject, assertPositiveNumber, assertRequiredString, isRequiredString } from "../../utils/asserts.ts";
import { Breaker } from "../../utils/breaker.ts";
import { BinaryBYOBCodec } from "../../../core/codec.ts";
import { ServiceResolver } from "../../dependency/service.ts";
import { CAManager, provideCAManager } from "./manager.ts";
import { AnyCAEnvelope, CADefinition, CAEnvelope } from "./define.ts";

export function decodeCAJsonEnvelope(message: string): AnyCAEnvelope {
  const envelope = JSON.parse(message);
  assertObject<AnyCAEnvelope>(envelope, "invalid-game-action-envelope");
  const { id, kind, params } = envelope;
  assertPositiveNumber(id, "invalid-game-action-envelope-id");
  assertRequiredString(kind, "invalid-game-action-envelope-kind");
  assertObject(params, "invalid-game-action-envelope-params");
  return { id, kind, params };
}

export interface CABinaryHeader {
  readonly key: number;
  readonly id: number;
}

export const CA_BINARY_HEADER_BYTE_LENGTH = 4;

export const gaBinaryHeaderCodec: BinaryBYOBCodec<CABinaryHeader> = {
  calcByteLength(): number {
    return CA_BINARY_HEADER_BYTE_LENGTH;
  },
  decode: function (buffer: ArrayBuffer, byteOffset: number): CABinaryHeader {
    const dv = new DataView(buffer, byteOffset);
    const key = dv.getUint16(0, true);
    const id = dv.getUint16(2, true);
    return { key, id };
  },
  encode: function (buffer: ArrayBuffer, byteOffset: number, data: CABinaryHeader): void {
    const { id, key } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setUint16(0, key, true);
    dv.setUint16(2, id, true);
  },
};

export class CACodec {
  public constructor(
    public manager: CAManager,
  ) {}

  public decode<TData>(message: unknown): [CADefinition<TData>, CAEnvelope<TData>] {
    if (isRequiredString(message)) {
      const envelope = decodeCAJsonEnvelope(message);
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
      const params = encoding.codec.decode(message, CA_BINARY_HEADER_BYTE_LENGTH);
      const envelope: CAEnvelope<TData> = { id, kind, params };
      return [definition, envelope];
    } else {
      throw new Breaker("unexpected-game-action-communication-message");
    }
  }

  public encode<TData>(definition: CADefinition<TData>, envelope: CAEnvelope<TData>): string | ArrayBuffer {
    const { encoding } = definition;
    const type = encoding.type;
    if (type === "json") {
      const data = JSON.stringify(envelope);
      return data;
    } else if (type === "binary") {
      const { codec, key } = encoding;
      const { id, params } = envelope;
      const byteLength = CA_BINARY_HEADER_BYTE_LENGTH + codec.calcByteLength(params);
      const buffer = new ArrayBuffer(byteLength);
      gaBinaryHeaderCodec.encode(buffer, 0, { id, key });
      codec.encode(buffer, CA_BINARY_HEADER_BYTE_LENGTH, params);
      return buffer;
    } else {
      throw new Breaker("unexpected-game-action-definition");
    }
  }
}

export function provideCACodec(resolver: ServiceResolver): CACodec {
  return new CACodec(
    resolver.resolve(provideCAManager),
  );
}
