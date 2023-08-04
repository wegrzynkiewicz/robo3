import { registerService } from "../../dependency/service.ts";
import { GameActionEnvelope } from "../foundation.ts";
import { GameActionProcessor } from "../processor.ts";
import { AbstractGameActionCommunicator } from "./communicator.ts";
import { RPCCodec, TableEncodingRPCCodec, tableEncodingRPCCodec } from "./rpc.ts";

export class OnlineRPCGameActionCommunicator extends AbstractGameActionCommunicator {
  protected readonly codec: RPCCodec;
  protected readonly ws: WebSocket;

  public constructor(
    { codec, processor, ws }: {
      codec: RPCCodec;
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
    const data = this.codec.encode(action);
    this.ws.send(data);
    // TODO: process WS
  }
}

export const onlineRPCGameActionCommunicator = registerService({
  dependencies: {
    codec: tableEncodingRPCCodec,
  },
  provider: async (
    { codec }: {
      codec: TableEncodingRPCCodec;
    },
    { processor, ws }: {
      processor: GameActionProcessor;
      ws: WebSocket;
    },
  ) => {
    return new OnlineRPCGameActionCommunicator({ codec, processor, ws });
  },
});
