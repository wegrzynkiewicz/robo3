import { Breaker } from "../../../common/asserts.ts";
import { registerService } from "../../dependency/service.ts";
import { GameActionEnvelope } from "../foundation.ts";
import { GameActionProcessor } from "../processor.ts";
import { AbstractGameActionCommunicator } from "./communicator.ts";
import { GameActionEnvelopeCodec, gameActionEnvelopeCodec } from "./rpc.ts";

export class OnlineRPCGameActionCommunicator extends AbstractGameActionCommunicator {
  protected readonly codec: GameActionEnvelopeCodec;
  protected readonly ws: WebSocket;

  public constructor(
    { codec, processor, ws }: {
      codec: GameActionEnvelopeCodec;
      processor: GameActionProcessor;
      ws: WebSocket;
    },
  ) {
    super({ processor });
    this.codec = codec;
    this.ws = ws;
  }

  public async receive(message: unknown): Promise<void> {
    const envelope = this.codec.decode(message);
    await this.processEnvelope(envelope);
  }

  protected sendData(action: GameActionEnvelope): void {
    const { codec, ws } = this;
    const { readyState } = ws;
    const data = codec.encode(action);
    if (readyState !== ws.OPEN) {
      throw new Breaker('ws-not-open', { action, readyState });
    }
    ws.send(data);
    // TODO: process WS
  }
}

export const onlineRPCGameActionCommunicator = registerService({
  dependencies: {
    codec: gameActionEnvelopeCodec,
  },
  provider: async (
    { codec }: {
      codec: GameActionEnvelopeCodec;
    },
    { processor, ws }: {
      processor: GameActionProcessor;
      ws: WebSocket;
    },
  ) => {
    return new OnlineRPCGameActionCommunicator({ codec, processor, ws });
  },
});
