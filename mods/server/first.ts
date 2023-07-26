import { Application, Router } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { assertRequiredString, Breaker } from "../common/asserts.ts";
import { logger } from "../common/logger.ts";
import { TableEncodingRPCCodec } from "../core/action/rpc.ts";
import { EncodingTranslation } from "../common/useful.ts";
import { GameActionNotification, GameActionProcessor, GameActionRequest, OnlineRPCGameActionCommunicator } from "../core/action/exchange.ts";
const app = new Application({ logErrors: false });
const router = new Router();
router.get("/hello", (ctx) => {
  ctx.response.type = "json";
  ctx.response.body = JSON.stringify({ hello: "world!" });
});

router.post("/login", (ctx) => {
  ctx.response.type = "json";
  ctx.response.body = JSON.stringify({
    token: "123",
  });
});

class WSManager {
}

Deno.addSignalListener(
  "SIGTERM",
  () => {
    console.log("SIGTERM!");
  },
);

interface WSSStrategy {
  processMessage(message: MessageEvent<any>): Promise<void>;
}

const unauthorizeWSSStrategy: WSSStrategy = {
  async processMessage(message: MessageEvent<unknown>): Promise<void> {
    const { data } = message;
    assertRequiredString(data, "invalid-authorize-message");
    const request = JSON.parse(data);
  },
};

router.get("/wss/:token", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501, "lol");
  }

  ctx.request.headers;
  const ws = ctx.upgrade();

  ws.onopen = (event) => {
  };

  let strategy = unauthorizeWSSStrategy;

  const processor: GameActionProcessor = {
    processRequest: function (request: GameActionRequest): Promise<Record<string, unknown>> {
      return Promise.resolve({ data: 123, tix: request.id });
    },
    processNotification: async function (notification: GameActionNotification): Promise<void> {
    }
  }
  const actionTranslation: EncodingTranslation<string> = {
    byIndex: ["error"],
    byKey: new Map([['error', 0]]),
  }
  const codec = new TableEncodingRPCCodec({ actionTranslation });
  const communicator = new OnlineRPCGameActionCommunicator({ codec, processor, ws });

  ws.onmessage = async (message) => {
    try {
      await communicator.receive(message.data);
    } catch (error) {
      logger.error("error-when-processing-wss-message", { error });
      ws.close(1008, error instanceof Breaker ? error.message : "unknown-error");
    }
  };

  let i = 1;
  const internal = setInterval(() => {
    const counter = (i++).toString();
    communicator.notify('tick', { counter });
  }, 10000);

  ws.onclose = () => {
    console.log("Disconncted from client");
    clearInterval(internal);
  };
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 8000 });
