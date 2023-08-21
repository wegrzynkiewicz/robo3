import { Breaker } from "../../common/asserts.ts";
import { ChunkDTO } from "../../core/chunk/chunk.ts";
import { ChunkId } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";
import { registerService } from "../../core/dependency/service.ts";
import { Position } from "../../core/numbers.ts";

export interface Sprite {
  absolutePosition: Position,
  
}

export class Chunk {
  public segment?: ChunkSegment;
  public constructor(
    public chunkId: ChunkId,
  ) {

  }

  public processGO() {

  }
}

export class ChunkManager {
  public readonly chunks = new Map<string, Chunk>();

  public update(chunkDTO: ChunkDTO) {
    const { chunkId: hex } = chunkDTO;
    const chunkId = ChunkId.fromHex(hex);
    const chunk = new Chunk(chunkId);
    this.chunks.set(hex, chunk);
  }

  public updateSegment(chunkId: ChunkId, segment: ChunkSegment) {
    const hex = chunkId.toHex();
    const chunk = this.chunks.get(hex);
    if (chunk === undefined) {
      throw new Breaker();
    }
    chunk.segment = segment;
  }
}

export const chunkManagerService = registerService({
  provider: async () => (new ChunkManager()),
  singleton: true,
});
