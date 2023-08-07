import { assertObject, assertPositiveNumber, assertRequiredString, Breaker, isRequiredString } from "../../../common/asserts.ts";
import { EncodingTranslation } from "../../../common/useful.ts";
import { registerService } from "../../dependency/service.ts";
import { GameActionEnvelope, UnknownGameActionCodec } from "../foundation.ts";
import { actionTranslation } from "./actionTranslation.ts";

export interface RPCCodec {
  encode(envelope: GameActionEnvelope): string | ArrayBuffer;
  decode(data: unknown): GameActionEnvelope;
}

const allowedActionKinds = ["err", "not", "req", "res"];

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

export class TableEncodingRPCCodec implements RPCCodec {
  public readonly actionTranslation: EncodingTranslation<UnknownGameActionCodec>;
  public constructor(
    { actionTranslation }: {
      actionTranslation: EncodingTranslation<UnknownGameActionCodec>;
    },
  ) {
    this.actionTranslation = actionTranslation;
  }

  public decode(data: unknown): GameActionEnvelope {
    if (isRequiredString(data)) {
      return decodeJSONRPCMessage(data);
    }
    if (data instanceof ArrayBuffer) {
    }
    throw new Breaker("TODO");
  }

  public encode(envelope: GameActionEnvelope): string | ArrayBuffer {
    const { code, id, params, kind } = envelope;
    const codec = this.actionTranslation.byKey.get(code);
    if (codec === undefined) {
      return JSON.stringify(envelope);
    }
    const size = 9 + codec.calcBufferSize(params);
    const actionIndex = codec.index;
    const ab = new ArrayBuffer(size);
    const dv = new DataView(ab, 0);
    dv.setUint8(0, allowedActionKinds.indexOf(kind) + 1);
    dv.setUint32(1, actionIndex, true);
    dv.setUint32(5, id, true);
    codec.encode(ab, 9, params);
    return ab;
  }
}

export const tableEncodingRPCCodec = registerService({
  dependencies: {
    actionTranslation,
  },
  provider: async (
    { actionTranslation }: {
      actionTranslation: EncodingTranslation<UnknownGameActionCodec>;
    },
  ) => {
    return new TableEncodingRPCCodec({ actionTranslation });
  },
});
