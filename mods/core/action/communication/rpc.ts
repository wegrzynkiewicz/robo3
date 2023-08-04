import { assertObject, assertPositiveNumber, assertRequiredString, Breaker, isRequiredString } from "../../../common/asserts.ts";
import { EncodingTranslation } from "../../../common/useful.ts";
import { registerService } from "../../dependency/service.ts";
import { GameActionEnvelope } from "../foundation.ts";
import { actionTranslation } from "./actionTranslation.ts";

export interface RPCCodec {
  encode(envelope: GameActionEnvelope): string | Uint8Array;
  decode(data: unknown): GameActionEnvelope;
}

export function decodeJSONRPCMessage(data: string): GameActionEnvelope {
  const envelope = JSON.parse(data);
  assertObject<GameActionEnvelope>(envelope, "invalid-game-action-envelope");
  const { id, params, type } = envelope;
  assertPositiveNumber(id, "invalid-game-action-envelope-id");
  assertObject(params, "invalid-game-action-envelope-params");
  switch (type) {
    case "err": {
      const { error } = envelope;
      assertRequiredString(error, "invalid-game-action-error", { error });
      return { id, error, params, type };
    }
    case "not": {
      const { notify } = envelope;
      assertRequiredString(notify, "invalid-game-action-notification", { notify });
      return { id, notify, params, type };
    }
    case "req": {
      const { request } = envelope;
      assertRequiredString(request, "invalid-game-action-request", { request });
      return { id, params, request, type };
    }
    case "res": {
      const { response } = envelope;
      assertRequiredString(response, "invalid-game-action-response", { response });
      return { id, params, response, type };
    }
    default: {
      throw new Breaker("invalid-game-action-envelope-type", { type });
    }
  }
}

export class TableEncodingRPCCodec implements RPCCodec {
  public readonly actionTranslation: EncodingTranslation<string>;
  public constructor(
    { actionTranslation }: {
      actionTranslation: EncodingTranslation<string>;
    },
  ) {
    this.actionTranslation = actionTranslation;
  }

  public decode(data: unknown): GameActionEnvelope {
    if (isRequiredString(data)) {
      return decodeJSONRPCMessage(data);
    }
    if (data instanceof Uint8Array) {
      const { buffer, byteLength, byteOffset } = data;
      const dv = new DataView(buffer, byteLength, byteOffset);
      const id = dv.getInt32(0, true);
      const typeCode = dv.getInt32(4, true);
    }
    throw new Breaker("TODO");
  }

  public encode(envelope: GameActionEnvelope): string | Uint8Array {
    const { id, params, type } = envelope;
    if (params.binary === undefined) {
      return JSON.stringify(envelope);
    }
    throw new Breaker("TODO");
  }
}

export const tableEncodingRPCCodec = registerService({
  dependencies: {
    actionTranslation,
  },
  provider: async (
    { actionTranslation }: {
      actionTranslation: EncodingTranslation<string>;
    },
  ) => {
    return new TableEncodingRPCCodec({ actionTranslation });
  },
});
