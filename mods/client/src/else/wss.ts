import { EncodingTranslation } from "../../../common/useful.ts";
import { GameActionNotification, GameActionProcessor, GameActionRequest, OnlineRPCGameActionCommunicator } from "../../../core/action/exchange.ts";
import { TableEncodingRPCCodec } from "../../../core/action/rpc.ts";

const ws = new WebSocket("ws://token:token@localhost:8000/wss/token");
const actionTranslation: EncodingTranslation<string> = {
  byIndex: ["error"],
  byKey: new Map([['error', 0]]),
}
const codec = new TableEncodingRPCCodec({ actionTranslation });
const processor: GameActionProcessor = {
  processRequest: function (request: GameActionRequest): Promise<Record<string, unknown>> {
    return Promise.resolve({ data: 123, tix: request.id });
  },
  processNotification: async function (notification: GameActionNotification): Promise<void> {
  }
}
const communicator = new OnlineRPCGameActionCommunicator({ codec, processor, ws });

ws.addEventListener("open", (event) => {
  communicator.request('login', { token: 123 });
  const data = new Uint8Array(8);
  data.set([1, 2, 3, 4, 5, 6, 7, 8]);
  communicator.request('encoder', { type: 123, data });
});

// Listen for messages
ws.addEventListener("message", async (message) => {
  await communicator.receive(message.data);
});

ws.addEventListener("close", (event) => {
  console.log("Close", event);
});
