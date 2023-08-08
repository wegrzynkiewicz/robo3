import { assertObject, assertPositiveNumber, assertRequiredString, Breaker, isRequiredString } from "../../../common/asserts.ts";
import { BinarySerializable, fromArrayBuffer, toArrayBuffer } from "../../../common/binary.ts";
import { registerService } from "../../dependency/service.ts";
import { GameActionCodecManager, gameActionCodecManager } from "../codec.ts";
import { GameActionEnvelope, GameActionEnvelopeKind } from "../foundation.ts";

export interface GameActionEnvelopeCodec {
  encode(envelope: GameActionEnvelope): string | ArrayBuffer;
  decode(data: unknown): GameActionEnvelope;
}

export function decodeJSONRPCMessage(data: string): GameActionEnvelope {
  const envelope = JSON.parse(data);
  assertObject<GameActionEnvelope>(envelope, "invalid-game-action-envelope");
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

export class GameActionEnvelopeBinaryHeader implements BinarySerializable {

  public static readonly BYTE_LENGTH = 12;

  public constructor(
    public readonly kind: GameActionEnvelopeKind,
    public readonly index: number,
    public readonly id: number,
  ) {
  }

  public toDataView(dv: DataView): void {
    dv.setUint32(0, allowedActionKinds.indexOf(this.kind), true);
    dv.setUint32(4, this.index, true);
    dv.setUint32(8, this.id, true);
  }

  public static fromDataView(dv: DataView): GameActionEnvelopeBinaryHeader {
    const kind = allowedActionKinds[dv.getUint32(0, true)];
    assertPositiveNumber(kind, 'invalid-kind-of-serialized-game-action-envelope-binary-header');
    const index = dv.getUint16(4, true);
    const id = dv.getUint16(8, true);
    return new GameActionEnvelopeBinaryHeader(kind, index, id);
  }
}

const byteOffset = GameActionEnvelopeBinaryHeader.BYTE_LENGTH;

const provider = async (
  { gameActionCodecManager }: {
    gameActionCodecManager: GameActionCodecManager;
  },
) => {
  const codec: GameActionEnvelopeCodec = {
    decode(data: unknown): GameActionEnvelope {
      if (isRequiredString(data)) {
        return decodeJSONRPCMessage(data);
      }
      if (data instanceof ArrayBuffer) {
        const buffer = data;
        const header = fromArrayBuffer(buffer, 0, GameActionEnvelopeBinaryHeader);
        const { index, id, kind } = header;
        const binding = gameActionCodecManager.byIndex.get(index);
        if (binding === undefined) {
          throw new Breaker('cannot-decode-envelope-with-unknown-index', { header });
        }
        const { codec } = binding;
        const params = codec.decode(buffer, byteOffset);
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
    encode(envelope: GameActionEnvelope): string | ArrayBuffer {
      const { code, id, params, kind } = envelope;
      const binding = gameActionCodecManager.byKey.get(code);
      if (binding === undefined) {
        return JSON.stringify(envelope);
      }
      const { codec, index } = binding;
      const totalLength = byteOffset + codec.calcBufferSize(params);
      const buffer = new ArrayBuffer(totalLength);
      const header = new GameActionEnvelopeBinaryHeader(kind, index, id);
      toArrayBuffer(buffer, 0, header);
      codec.encode(buffer, byteOffset, params);
      return buffer;
    }
  };
  return codec;
}

export const gameActionEnvelopeCodec = registerService({
  dependencies: {
    gameActionCodecManager,
  },
  provider,
});
