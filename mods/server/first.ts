import { assertRequiredString, Breaker } from "../common/asserts.ts";
import { logger } from "../common/logger.ts";
import { resolveService } from "../core/dependency/service.ts";
import { Application, MongoClient, Router } from "./deps.ts";
import { ChunkDoc } from "../storage/chunk/chunk.ts";
import { onlineRPCGameActionCommunicator } from "../core/action/communication/onlineCommunicator.ts";
import { serverGameActionProcessor } from "../server-domain/action/bootstrap.ts";

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

(async () => {
  const url = "mongodb://root:example@localhost:27017?authSource=admin";
  const client = new MongoClient(url);
  await client.connect();

  const db = client.db("app");
  const collection = db.collection("chunks");
  const data = await collection.find().toArray();
  console.dir(data);
  const chunk = data[0] as unknown as ChunkDoc;
  for (const c of data) {
    console.log(c._id);
  }

  router.get("/wss/:token", async (ctx) => {
    if (!ctx.isUpgradable) {
      ctx.throw(501, "lol");
    }

    ctx.request.headers;

    const ws = ctx.upgrade();

    ws.onopen = (event) => {
      console.log('new client');
    };

    const processor = await resolveService(serverGameActionProcessor);
    const communicator = await resolveService(onlineRPCGameActionCommunicator, { processor, ws });

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
      communicator.notify("tick", { counter });
    }, 10000);

    ws.onclose = () => {
      console.log("Disconncted from client");
      clearInterval(internal);
    };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen({ port: 8000 });
})();
