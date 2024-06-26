import { Application, OpenAPI, Router } from "./deps.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../common/dependency/service.ts";
import { provideSpaceManager } from "../../common/space/space-manager.ts";
import { provideDBClient } from "./db.ts";
import { provideWebServer } from "./main-web-server.ts";
import { beingUpdateGADef } from "../../actions/being-update/being-update-ga.ts";
import { provideServerPlayerContextManager } from "./server-player-context/manager.ts";

const app = new Application({ logErrors: false });
const router = new Router();

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
  resolver.inject(provideMainServiceResolver, resolver);
  const server = resolver.resolve(provideWebServer);
  await server.listen();
  const client = resolver.resolve(provideDBClient);
  await client.connect();

  const db = client.db("app");
  const collection = db.collection("chunks");

  const playerContextManager = resolver.resolve(provideServerPlayerContextManager);
  const spaceManager = resolver.resolve(provideSpaceManager);
  const space = spaceManager.obtain(1);

  let beingCounter = 1;


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
      for (const playerContext of playerContextManager.byPlayerContextId.values()) {
        playerContext.dispatcher.send(beingUpdateGADef, being)
      }
    }
  }, 100);

  //   router.get("/wss/:token", async (ctx) => {
  //     if (!ctx.isUpgradable) {
  //       ctx.throw(501, "lol");
  //     }

  //     ctx.request.headers;

  //     const ws = ctx.upgrade();

  //     const data = await collection.find().toArray();
  //     const dx = data as unknown as ChunkDoc[];

  //     const chunks: ChunkDTO[] = [];
  //     const bf: { chunkId: ChunkId; segment: ChunkSegment }[] = [];
  //     for (const c of dx) {
  //       chunks.push({
  //         chunkId: c._id.toString("hex"),
  //         extended: [],
  //         tiles: c.tiles,
  //       });
  //       const decompressed = await decompress(c.data.buffer);
  //       const segment = ChunkSegment.createFromBuffer(decompressed, 0);
  //       bf.push({
  //         chunkId: ChunkId.fromHex(c._id.toString("hex")),
  //         segment,
  //       });
  //     }

  //     const being = space.beingManager.obtain(beingCounter++);

  //     const resolver = new ServiceResolver();
  //     resolver.inject(provideWebSocket, ws);
  //     const processor = resolver.resolve(provideServerGAProcessor);
  //     resolver.inject(provideGAProcessor, processor);
  //     const communicator = resolver.resolve(provideGACommunicator);
  //     const clientChannel = resolver.resolve(provideClientChannel);

  //     clientChannel.attachListeners();

  //     setTimeout(() => {
  //       communicator.sender.send(chunksUpdateGADef, { chunks });
  //       const chunkSize = 50;
  //       let j = 0;
  //       for (let i = 0; i < bf.length; i += chunkSize) {
  //         const chunks = bf.slice(i, i + chunkSize);
  //         setTimeout(() => {
  //           for (const c of chunks) {
  //             communicator.sender.send(chunkSegmentUpdateGADef, c);
  //           }
  //         }, 50 * (j++));
  //       }
  //     }, 500);
  //   });

  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen({ port: 8000 });
})();
