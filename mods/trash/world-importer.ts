import { ChunkId } from "../core/chunk/chunkId.ts";
import { resolveService } from "../core/dependency/service.ts";
import { dbClient } from "../server/db.ts";
import { ChunkDoc } from "../storage/chunk.ts";
import { Binary, deflate } from "../storage/deps.ts";
import { SpaceDoc } from "../storage/space.ts";

const BYTES_PER_GAME_OBJECT = 8;

export class Builder {
  public readonly buffer: ArrayBuffer;
  public readonly byteLength: number;
  public readonly byteOffset: number;
  public readonly totalSize: number;
  public readonly u1Array: Uint8Array;
  public readonly u4Array: Uint32Array;
  protected currentIndex = 0;

  public constructor(
    buffer: ArrayBuffer,
    byteOffset: number,
    byteLength: number,
  ) {
    if (byteLength % BYTES_PER_GAME_OBJECT !== 0) {
      throw new Error(`byte-length-must-be-multiply-of-${BYTES_PER_GAME_OBJECT}`);
    }
    this.buffer = buffer;
    this.byteLength = byteLength;
    this.byteOffset = byteOffset;
    this.totalSize = Math.floor(byteLength / BYTES_PER_GAME_OBJECT);
    this.u1Array = new Uint8Array(buffer, byteOffset, byteLength);
    this.u4Array = new Uint32Array(buffer, byteOffset, this.totalSize);
  }

  public size(): number {
    return this.currentIndex;
  }

  public push(positionIndex: number, goTypeId: number) {
    const index = this.currentIndex * 2;
    this.u4Array[index + 0] = positionIndex;
    this.u4Array[index + 1] = goTypeId;
    this.currentIndex++;
  }

  public getFilledArray(): Uint8Array {
    return new Uint8Array(
      this.buffer,
      this.byteOffset,
      this.currentIndex * BYTES_PER_GAME_OBJECT,
    );
  }

  public static allocate(numberOfGameObject: number): Builder {
    const byteOffset = 0;
    const byteLength = numberOfGameObject * BYTES_PER_GAME_OBJECT;
    const arrayBuffer = new ArrayBuffer(byteLength);
    return new Builder(arrayBuffer, byteOffset, byteLength);
  }
}

function generateBuilder(): Builder {
  const builder = Builder.allocate(32 * 32 * 2);
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const pos = y * 1024 + x * 32;
      const goTypeId = Math.floor(Math.random() * 256);
      builder.push(pos, goTypeId);
    }
  }
  return builder;
}

(async () => {
  const client = await resolveService(dbClient);
  const db = client.db("app");
  const collection = db.collection("chunks");
  const spaceId = 1;

  const z = 0;
  let i = 0;
  let sum = 0;
  console.time("test");
  for (let y = 0; y <= 4; y++) {
    for (let x = 0; x <= 4; x++) {
      const chunkId = new ChunkId(spaceId, x, y, z).toHex();
      const builder = generateBuilder();
      const buffer = builder.getFilledArray();
      const compressedBuffer = deflate(buffer, { level: 1, memLevel: 9 });
      sum += compressedBuffer.length;

      const chunk: ChunkDoc = {
        _id: Binary.createFromHexString(chunkId),
        extended: [],
        data: new Binary(compressedBuffer, 3),
        tiles: builder.size(),
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
  await db.collection("spaces").insertOne(space as any);

  await client.close();
})();
