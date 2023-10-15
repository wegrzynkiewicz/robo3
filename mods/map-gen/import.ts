import { ChunkId } from "../core/chunk/chunkId.ts";
import { ChunkSegment } from "../core/chunk/chunkSegment.ts";
import { ServiceResolver } from "../core/dependency/service.ts";
import { dbClient } from "../server/db.ts";
import { ChunkDoc } from "../storage/chunk.ts";
import { Binary, deflate } from "../storage/deps.ts";
import { SpaceDoc } from "../storage/space.ts";
import { NoiseGenerator } from "./NoiseGenerator.ts";

function generateChunkSegment(noise: Uint8Array, chunkId: ChunkId): ChunkSegment {
  const { z } = chunkId;
  const segment = ChunkSegment.createEmpty(0);
  for (let x = 0; x < 1024; x++) {
    const value = noise[x];
    const depth = Math.floor(value / 255 * 8);
    const goTypeId = z < depth ? 6 : z === depth ? 1 : 0;
    segment.grid.view[x] = goTypeId;
  }

  return segment;
}

(async () => {
  const resolver = new ServiceResolver();
  const client = await resolver.resolve(dbClient);
  const db = client.db("app");
  const collection = db.collection("chunks");
  const spaceId = 1;

  const noise = new Uint8Array(1024);
  const seed = 0.9054922579831908;
  const noiseGenerator = new NoiseGenerator(seed);

  await collection.deleteMany({});

  let sum = 0;
  console.time("test");
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      noiseGenerator.genChunkTerrain(noise, x, y);
      for (let z = 0; z < 8; z++) {
        const chunkId = new ChunkId(spaceId, x, y, z);
        const chunkSegment = generateChunkSegment(noise, chunkId);
        const buffer = new Uint8Array(chunkSegment.buffer);
        const compressedBuffer = deflate(buffer, { level: 1, memLevel: 9 });
        sum += compressedBuffer.length;
        const chunk: ChunkDoc = {
          chunkId,
          _id: Binary.createFromHexString(chunkId.toHex()),
          extended: [],
          data: new Binary(compressedBuffer, 3),
          tiles: chunkSegment.list.count,
        } as any;
        await collection.insertOne(chunk as any);
      }
    }
  }
  console.timeEnd("test");
  console.log(sum / 25);

  const space: SpaceDoc = {
    _id: spaceId,
    coords: {
      b: 4,
      f: 0,
      l: 0,
      n: 0,
      r: 4,
      t: 0,
    },
    seed,
  } as any;
  await db.collection("spaces").deleteMany({});
  await db.collection("spaces").insertOne(space as any);

  await client.close();
})();
