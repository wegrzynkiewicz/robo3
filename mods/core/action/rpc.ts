import { assertObject, assertPositiveNumber, assertRequiredString, Breaker, isRequiredString } from "../../common/asserts.ts";
import { BinarySerializable, fromArrayBuffer, toArrayBuffer } from "../../common/binary.ts";
import { registerService } from "../dependency/service.ts";
import { GAEnvelope, GAKind, GAManager, GADefinition, gaManager } from "./foundation.ts";

export interface GAEnvelopeCodec {
  encode(envelope: GAEnvelope): string | ArrayBuffer;
  decode(data: unknown): GAEnvelope;
}

export function decodeGAEnvelope(data: string): GAEnvelope {
  const envelope = JSON.parse(data);
  assertObject<GAEnvelope>(envelope, "invalid-game-action-envelope");
  const { code, id, params, kind } = envelope;
  assertPositiveNumber(id, "invalid-game-action-envelope-id");
  assertObject(params, "invalid-game-action-envelope-params");
  assertRequiredString(code, "invalid-game-action-envelope-code");
  assertRequiredString(kind, "invalid-game-action-envelope-kind");
  if (!allowedActionKinds.includes(kind)) {
    throw new Breaker("invalid-game-action-envelope-kind", { kind });
  }
  return { code, id, kind, params };
}

const allowedActionKinds = ["err", "not", "req", "res"];

export class GAEnvelopeBinaryHeader implements BinarySerializable {

  public static readonly BYTE_LENGTH = 12;

  public constructor(
    public readonly kind: GAKind,
    public readonly index: number,
    public readonly id: number,
  ) {
  }

  public toDataView(dv: DataView): void {
    dv.setUint32(0, allowedActionKinds.indexOf(this.kind), true);
    dv.setUint32(4, this.index, true);
    dv.setUint32(8, this.id, true);
  }

  public static fromDataView(dv: DataView): GAEnvelopeBinaryHeader {
    const kind = allowedActionKinds[dv.getUint32(0, true)];
    assertPositiveNumber(kind, 'invalid-kind-of-serialized-game-action-envelope-binary-header');
    const index = dv.getUint16(4, true);
    const id = dv.getUint16(8, true);
    return new GAEnvelopeBinaryHeader(kind, index, id);
  }
}

const byteOffset = GAEnvelopeBinaryHeader.BYTE_LENGTH;

const provider = async (
  { gaManager }: {
    gaManager: GAManager;
  },
) => {
  const codec: GAEnvelopeCodec = {
    decode(data: ArrayBuffer): GAEnvelope {
      if (isRequiredString(data)) {
        return decodeJSONRPCMessage(data);
      }
      if (data instanceof ArrayBuffer) {
        const buffer = data;
        const header = fromArrayBuffer(buffer, 0, GAEnvelopeBinaryHeader);
        const { index, id, kind } = header;
        const binding = gaManager.byIndex.get(index);
        if (binding === undefined) {
          throw new Breaker('cannot-decode-envelope-with-unknown-index', { header });
        }
        const { definition } = binding;
        definition.code
        const params = definition.codec.decode(buffer, byteOffset);
        const envelope = {
          code: codec.code,
          id,
          kind,
          params,
        };
        return envelope;
      }
      throw new Breaker("TODO");
    },
    encode(definition: GADefinition, envelope: GAEnvelope): string | ArrayBuffer {
      const { code, id, params, kind } = envelope;
      const binding = gaManager.byKey.get(code);
      if (binding === undefined) {
        return JSON.stringify(envelope);
      }
      const { def, index } = binding;
      const totalLength = byteOffset + codec.calcBufferSize(params);
      const buffer = new ArrayBuffer(totalLength);
      const header = new GAEnvelopeBinaryHeader(kind, index, id);
      toArrayBuffer(buffer, 0, header);
      codec.encode(buffer, byteOffset, params);
      return buffer;
    }
  };
  return codec;
}

export const gameActionEnvelopeCodec = registerService({
  dependencies: {
    gaManager,
  },
  provider,
});
