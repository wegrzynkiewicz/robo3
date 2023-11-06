import { ChunkId } from "../core/chunk/chunkId.ts";
import { ChunkSegment } from "../core/chunk/chunkSegment.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { GONormChunkPosition } from "../core/game-object/position.ts";
import { dbClient } from "../server/db.ts";
import { ChunkDoc } from "../storage/chunk.ts";
import { Binary, deflate } from "../storage/deps.ts";
import { SpaceDoc } from "../storage/space.ts";

function generateChunkSegment(): ChunkSegment {
  const element = Math.floor(Math.random() * 100) + 1;
  const segment = ChunkSegment.createEmpty(element);
  const tile = Math.floor(Math.random() * 7) + 1;
  for (let x = 0; x < 1024; x++) {
    const goTypeId = tile;
    segment.grid.view[x] = goTypeId;
  }
  for (let i = 0; i < element; i++) {
    const x = Math.floor(Math.random() * 1024);
    const y = Math.floor(Math.random() * 1024);
    const position = GONormChunkPosition.fromChunkPosition(x, y, 0, 1024);
    // const goTypeId = Math.floor(Math.random() * 256);
    const goTypeId = Math.floor(Math.random() * 33) + 41;
    segment.list.write(i, goTypeId, position.index);
  }
  return segment;
}

(async () => {
  const resolver = new ServiceResolver();
  const client = await resolver.resolve(dbClient);
  const db = client.db("app");
  const collection = db.collection("chunks");
  const spaceId = 1;

  collection.deleteMany({});

  const z = 0;
  let i = 0;
  let sum = 0;
  console.time("test");
  for (let y = 0; y <= 4; y++) {
    for (let x = 0; x <= 4; x++) {
      const chunkId = new ChunkId(spaceId, x, y, z).toHex();
      const chunkSegment = generateChunkSegment();
      const buffer = new Uint8Array(chunkSegment.buffer);
      const compressedBuffer = deflate(buffer, { level: 1, memLevel: 9 });
      sum += compressedBuffer.length;

      const chunk: ChunkDoc = {
        _id: Binary.createFromHexString(chunkId),
        extended: [],
        data: new Binary(compressedBuffer, 3),
        tiles: chunkSegment.list.count,
      };
      await collection.insertOne(chunk as any);
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
  };
  await db.collection("spaces").deleteMany({});
  await db.collection("spaces").insertOne(space as any);

  await client.close();
})();
