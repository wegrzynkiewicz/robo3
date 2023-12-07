import { Application, OpenAPI, Router } from "./deps.ts";
import { ChunkDoc } from "../../common/storage/chunk.ts";
import { ChunkId } from "../../common/chunk/chunk-id.ts";
import { ChunkDTO } from "../../common/chunk/chunk.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { chunkSegmentUpdateGADef } from "../../domain/chunk/chunk-segment-update-ga.ts";
import { chunksUpdateGADef } from "../../domain/chunk/chunks-update-ga.ts";
import { decompress } from "../../common/utils/binary.ts";
import { ChunkSegment } from "../../common/chunk/chunk-segment.ts";
import { beingUpdateGADef } from "../../actions/being-update/being-update-ga.ts";
import { provideSpaceManager } from "../../common/space/space-manager.ts";
import { provideClientChannel } from "./ws.ts";
import { provideDBClient } from "./db.ts";
import { provideGameClientManager } from "./game-client-manager.ts";
import { provideWebSocket } from "../../common/action/sender.ts";
import { provideServerGAProcessor } from "../../domain-server/server-ga-processor.ts";
import { provideGAProcessor } from "../../common/action/processor.ts";
import { provideGACommunicator } from "../../common/action/communication.ts";
import { provideWebServer } from "./main-web-server.ts";

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
  const server = resolver.resolve(provideWebServer);
  await server.listen();
  const client = resolver.resolve(provideDBClient);
  await client.connect();
  const gameClientManager = resolver.resolve(provideGameClientManager);

  const db = client.db("app");
  const collection = db.collection("chunks");

  const spaceManager = resolver.resolve(provideSpaceManager);
  const space = spaceManager.obtain(1);

  let beingCounter = 1;

  console.log("starting...");

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
    resolver.inject(provideWebSocket, ws);
    const processor = resolver.resolve(provideServerGAProcessor);
    resolver.inject(provideGAProcessor, processor);
    const communicator = resolver.resolve(provideGACommunicator);
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
  console.log("Server started!");
})();
