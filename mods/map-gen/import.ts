import { ChunkId } from "../core/chunk/chunkId.ts";
import { ChunkSegment } from "../core/chunk/chunkSegment.ts";
import { ServiceResolver } from "../core/dependency/service.ts";
import { dbClient } from "../server/db.ts";
import { ChunkDoc } from "../storage/chunk.ts";
import { Binary, deflate } from "../storage/deps.ts";
import { SpaceDoc } from "../storage/space.ts";
import { NoiseGenerator } from "./NoiseGenerator.ts";

const ter = { "LSE": 65, "UN": 81, "LSW": 67, "CSE": 68, "ES": 69, "CSW": 70, "UW": 71, "EMP": 72, "UE": 73, "EE": 74, "FILL": 75, "EW": 76, "LNE": 77, "US": 78, "LNW": 79, "CNE": 80, "EN": 81, "CNW": 82 };

function generateChunkSegment(noise: Uint8Array, chunkId: ChunkId): ChunkSegment {
  const { z } = chunkId;
  const segment = ChunkSegment.createEmpty(0);
  for (let x = 0; x < 1024; x++) {
    const value = noise[x];
    const depth = Math.floor(value / 255 * 8);
    const goTypeId = z < depth ? 6 : z === depth ? 1 : 0;
    segment.grid.view[x] = goTypeId;
  }


  const view = segment.grid.view.slice(0, 1024);

  function read(x: number, y: number) {
    if (y < 0 || y > 31) return 0;
    if (x < 0 || x > 31) return 0;
    const i = y * 32 + x;
    return view[i];
  }
  function process(x: number, y: number): number {
    const f = read(x, y);
    if (f === 0) {
      const t = read(x, y - 1) === 0 ? 0 : 0b0001;
      const r = read(x + 1, y) === 0 ? 0 : 0b0010;
      const b = read(x, y + 1) === 0 ? 0 : 0b0100;
      const l = read(x - 1, y) === 0 ? 0 : 0b1000;
      const v = t | r | b | l;
      if (v === 0b0001) return ter['EN'];
      if (v === 0b0010) return ter['EE'];
      if (v === 0b0011) return ter['LNE'];
      if (v === 0b0100) return ter['ES'];
      if (v === 0b0101) return ter['FILL'];
      if (v === 0b0110) return ter['LSE'];
      if (v === 0b0111) return ter['UW'];
      if (v === 0b1000) return ter['EW'];
      if (v === 0b1001) return ter['LNW'];
      if (v === 0b1010) return ter['FILL'];
      if (v === 0b1011) return ter['US'];
      if (v === 0b1100) return ter['LSW'];
      if (v === 0b1101) return ter['UE'];
      if (v === 0b1110) return ter['US'];
      if (v === 0b1111) return ter['EMP'];
      if (v === 0) {
        if (read(x - 1, y - 1) !== 0) return ter['CNW'];
        if (read(x + 1, y - 1) !== 0) return ter['CNE'];
        if (read(x - 1, y + 1) !== 0) return ter['CSW'];
        if (read(x + 1, y + 1) !== 0) return ter['CSE'];
      }
      return ter['FILL'];
    }
    return f;
  }

  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      const i = y * 32 + x;
      segment.grid.view[i] = process(x, y);
    }
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
