import { ChunkId } from "../common/chunk/chunk-id.ts";
import { ChunkSegment } from "../common/chunk/chunk-segment.ts";
import { ServiceResolver } from "../common/dependency/service.ts";
import { dbClient } from "../server/db.ts";
import { ChunkDoc } from "../common/storage/chunk.ts";
import { Binary, deflate } from "../common/storage/deps.ts";
import { NoiseGenerator } from "./noise-generator.ts";

function generateChunkSegment(noise: Uint8Array, chunkId: ChunkId): ChunkSegment {
  const { z } = chunkId;
  const segment = ChunkSegment.createEmpty(0);
  for (let x = 0; x < 1024; x++) {
    const value = noise[x];
    const depth = Math.floor(value / 255 * 16);
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

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      noiseGenerator.genChunkTerrain(noise, x, y);
      for (let z = 0; z < 16; z++) {
        const chunkId = ChunkId.fromScalars(spaceId, x, y, z);
        const chunkSegment = generateChunkSegment(noise, chunkId);
        const buffer = new Uint8Array(chunkSegment.buffer);
        const compressedBuffer = deflate(buffer, { level: 1, memLevel: 9 });
        const chunk: ChunkDoc = {
          chunkId,
          _id: Binary.createFromHexString(chunkId.key),
          extended: [],
          data: new Binary(compressedBuffer, 3),
          tiles: chunkSegment.list.count,
        } as any;
        await collection.insertOne(chunk as any);
      }
    }
  }
  await client.close();
})();
