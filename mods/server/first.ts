import { Application, Router } from "./deps.ts";
import { ChunkDoc } from "../storage/chunk.ts";
import { dbClient } from "./db.ts";
import { ChunkId } from "../core/chunk/chunkId.ts";
import { ChunkDTO } from "../core/chunk/chunk.ts";
import { serverGAProcessor } from "../domain-server/serverGAProcessor.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { gaCommunicator } from "../core/action/communication.ts";
import { gaProcessorService } from "../core/action/processor.ts";
import { chunkSegmentUpdateGADef } from "../domain/chunk/chunkSegmentUpdateGA.ts";
import { chunksUpdateGADef } from "../domain/chunk/chunksUpdateGA.ts";
import { decompress } from "../common/binary.ts";
import { ChunkSegment } from "../core/chunk/chunkSegment.ts";
import { spaceManagerService } from "../core/space/SpaceManager.ts";
import { beingUpdateGADef } from "../domain-client/player-move/beingUpdate.ts";
import { clientChannelService } from "./ws.ts";
import { gameClientManagerService } from "./GameClientManager.ts";
import { webSocketService } from "../core/action/sender.ts";

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

router.get("/api.json", (ctx) => {
  ctx.response.type = "json";
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  const info: OpenAPI.InfoObject = {
    title: "robo24",
    version: "1",
    summary: "test summary",
  };
  const document: OpenAPI.Document = {
    info,
    paths: {},
    openapi: "3.0.0",
  };
  ctx.response.body = JSON.stringify(document);
});

(async () => {
  const resolver = new ServiceResolver();
  const client = await resolver.resolve(dbClient);
  const gameClientManager = resolver.resolve(provideGAmeClientManager);

  const db = client.db("app");
  const collection = db.collection("chunks");

  const spaceManager = resolver.resolve(provideSpaceManager);
  const space = spaceManager.obtain(1);

  let beingCounter = 1;

  router.get("/wss/:token", async (ctx) => {
    if (!ctx.isUpgradable) {
      ctx.throw(501, "lol");
    }

    ctx.request.headers;

    const ws = ctx.upgrade();

    const data = await collection.find().toArray();
    const dx = data as unknown as ChunkDoc[];

    const chunks: ChunkDTO[] = [];
    const bf: { chunkId: ChunkId; segment: ChunkSegment }[] = [];
    for (const c of dx) {
      chunks.push({
        chunkId: c._id.toString("hex"),
        extended: [],
        tiles: c.tiles,
      });
      const decompressed = await decompress(c.data.buffer);
      const segment = ChunkSegment.createFromBuffer(decompressed, 0);
      bf.push({
        chunkId: ChunkId.fromHex(c._id.toString("hex")),
        segment,
      });
    }

    const being = space.beingManager.obtain(beingCounter++);

    const resolver = new ServiceResolver();
    resolver.inject(webSocketService, ws);
    const processor = await resolver.resolve(serverGAProcessor);
    resolver.inject(gaProcessorService, processor);
    const communicator = await resolver.resolve(gaCommunicator);
    const clientChannel = resolver.resolve(provideClientChannel);

    clientChannel.attachListeners();

    setInterval(() => {
      for (const being of space.beingManager.byId.values()) {
        let x = 0;
        let y = 0;
        const { direct } = being;
        if (direct & 0b1000) {
          y = -1;
        }
        if (direct & 0b0100) {
          y = 1;
        }
        if (direct & 0b0010) {
          x = -1;
        }
        if (direct & 0b0001) {
          x = 1;
        }
        being.x += x * 16;
        being.y += y * 16;
        communicator.sender.send(beingUpdateGADef, being);
      }
    }, 100);

    setTimeout(() => {
      communicator.sender.send(chunksUpdateGADef, { chunks });
      const chunkSize = 50;
      let j = 0;
      for (let i = 0; i < bf.length; i += chunkSize) {
        const chunks = bf.slice(i, i + chunkSize);
        setTimeout(() => {
          for (const c of chunks) {
            communicator.sender.send(chunkSegmentUpdateGADef, c);
          }
        }, 50 * (j++));
      }
    }, 500);
  });

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen({ port: 8000 });
})();
