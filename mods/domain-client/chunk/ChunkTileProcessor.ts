import { Breaker } from "../../common/asserts.ts";
import { registerService } from "../../core/dependency/service.ts";
import { Chunk, ChunkManager } from "./chunkManager.ts";

export class Space {
  public readonly chunkManager = new ChunkManager();
  public constructor(
    public readonly spaceId: number,
  ) { }
}

export class SpaceManager {
  public bySpaceId = new Map<number, Space>();
}

const CHUNK_SIZE = 32;
const PROCESSOR_SIZE = 34;
const C = CHUNK_SIZE - 1;
const P = PROCESSOR_SIZE - 1;

function tileIndex(x: number, y: number): number {
  return y * CHUNK_SIZE + x;
}

function procIndex(x: number, y: number): number {
  return y * PROCESSOR_SIZE + x;
}

export class ChunkTileProcessor {

  public readonly view = new Uint16Array(PROCESSOR_SIZE ** 2);

  public constructor(
    protected spaceManager: SpaceManager,
  ) { }

  public prepareView(chunk: Chunk): void {
    const { chunkId: { spaceId, x, y, z } } = chunk;
    const space = this.spaceManager.bySpaceId.get(spaceId);
    if (space === undefined) {
      throw new Breaker('not-found-space-by-id', { spaceId });
    }
    const cm = space.chunkManager;

    const chunkQ = cm.getByCoords(x - 1, y - 1, z);
    const chunkW = cm.getByCoords(x + 0, y - 1, z);
    const chunkE = cm.getByCoords(x + 1, y - 1, z);
    const chunkA = cm.getByCoords(x - 1, y + 0, z);
    const chunkS = chunk;
    const chunkD = cm.getByCoords(x + 1, y + 0, z);
    const chunkZ = cm.getByCoords(x - 1, y + 1, z);
    const chunkX = cm.getByCoords(x + 0, y + 1, z);
    const chunkC = cm.getByCoords(x + 1, y + 1, z);

    this.view[procIndex(0, 0)] = chunkQ?.segment?.grid.view[tileIndex(C, C)] ?? 0;
    this.view[procIndex(P, 0)] = chunkE?.segment?.grid.view[tileIndex(0, C)] ?? 0;
    this.view[procIndex(0, P)] = chunkZ?.segment?.grid.view[tileIndex(C, 0)] ?? 0;
    this.view[procIndex(P, P)] = chunkC?.segment?.grid.view[tileIndex(0, 0)] ?? 0;
    for (let i = 0; i < CHUNK_SIZE; i++) {
      this.view[procIndex(i + 1, 0)] = chunkW?.segment?.grid.view[tileIndex(i, C)] ?? 0;
      this.view[procIndex(i + 1, P)] = chunkX?.segment?.grid.view[tileIndex(i, 0)] ?? 0;
      this.view[procIndex(0, i + 1)] = chunkA?.segment?.grid.view[tileIndex(C, i)] ?? 0;
      this.view[procIndex(P, i + 1)] = chunkD?.segment?.grid.view[tileIndex(0, i)] ?? 0;
      for (let j = 0; j < CHUNK_SIZE; j++) {
        this.view[procIndex(j + 1, i + 1)] = chunkS?.segment?.grid.view[tileIndex(j, i)] ?? 0;
      }
    }
  }

  public process(chunk: Chunk): void {
    this.prepareView(chunk);
  }
}

export const chunkTileProcessorService = registerService({
  async provider(): Promise<ChunkTileProcessor> {
    return new ChunkTileProcessor();
  },
});
