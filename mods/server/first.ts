import { Breaker } from "../common/asserts.ts";
import { logger } from "../common/logger.ts";
import { Application, Router } from "./deps.ts";
import { ChunkDoc } from "../storage/chunk.ts";
import { dbClient } from "./db.ts";
import { ChunkId } from "../core/chunk/chunkId.ts";
import { Binary } from "../storage/deps.ts";
import { ChunkDTO } from "../core/chunk/chunk.ts";
import { serverGAProcessor } from "../domain-server/serverGAProcessor.ts";
import { gaSenderService, OnlineGASender } from "../core/action/sender.ts";
import { ServiceResolver } from "../core/dependency/service.ts";
import { gaCommunicator } from "../core/action/communication.ts";
import { gaProcessorService } from "../core/action/processor.ts";

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

(async () => {
  const resolver = new ServiceResolver();
  const client = await resolver.resolve(dbClient);
  const db = client.db("app");
  const collection = db.collection("chunks");
  const data = await collection.find().toArray();
  const dx = data as unknown as ChunkDoc[];

  const chunks: ChunkDTO[] = [];
  const bf: { chunkId: ChunkId; data: Binary }[] = [];
  for (const c of dx) {
    chunks.push({
      chunkId: c._id.toString("hex"),
      extended: [],
      tiles: c.tiles,
    });
    bf.push({
      chunkId: ChunkId.fromHex(c._id.toString("hex")),
      data: c.data,
    });
  }

  router.get("/wss/:token", async (ctx) => {
    if (!ctx.isUpgradable) {
      ctx.throw(501, "lol");
    }

    ctx.request.headers;

    const ws = ctx.upgrade();

    ws.onopen = (event) => {
      console.log("new client");
    };

    const resolver = new ServiceResolver();
    const sender = new OnlineGASender(ws);
    resolver.inject(gaSenderService, sender);
    const processor = await resolver.resolve(serverGAProcessor);
    resolver.inject(gaProcessorService, processor);
    const communicator = await resolver.resolve(gaCommunicator);

    ws.onmessage = async (message) => {
      try {
        await communicator.receiver.receive(message.data);
      } catch (error) {
        logger.error("error-when-processing-wss-message", { error });
        ws.close(4001, error instanceof Breaker ? error.message : "unknown-error");
      }
    };

    // setTimeout(() => {
    //   communicator.notify(chunksUpdateGADef, { chunks });
    //   for (const c of bf) {
    //     const binary = c.data.buffer;
    //     communicator.notify(chunksSegmentUpdateGADef, { chunkId: c.chunkId, binary });
    //   }
    // }, 500);

    // let i = 1;
    // const internal = setInterval(() => {
    //   const counter = (i++).toString();
    //   communicator.notify("tick", { counter });
    // }, 1000);

    ws.onclose = (event) => {
      console.log("Disconncted from client");
      //   clearInterval(internal);
    };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen({ port: 8000 });
})();
