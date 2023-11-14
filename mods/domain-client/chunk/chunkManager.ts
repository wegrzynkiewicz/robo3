import { ChunkId } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";
import { GONormChunkPosition } from "../../core/game-object/position.ts";
import { registerService } from "../../dependency/service.ts";
import { CornerRectangle } from "../../math/CornerRectangle.ts";
import { Position } from "../../math/Position.ts";

export interface GOView {
  chunkPosition: Position;
  goTypeId: number;
  localId: number;
  normChunkPosition: GONormChunkPosition;
  spacePosition: Position;
  worldSpaceRect: CornerRectangle;
}

export class Chunk {
  public segment?: ChunkSegment;
  public readonly worldSpaceRect: CornerRectangle;
  public readonly worldSpaceBoundRect: CornerRectangle;
  public transparent = false;
  public constructor(
    public chunkId: ChunkId,
  ) {
    this.worldSpaceRect = this.chunkId.getWorldSpaceCornerRect();
    this.worldSpaceBoundRect = { ...this.worldSpaceRect };
  }
}

export class ChunkManager {
  public readonly byKey = new Map<string, Chunk>();

  public getByChunkId(chunkId: ChunkId): Chunk | undefined {
    const chunk = this.byKey.get(chunkId.key);
    return chunk;
  }

  public obtain(chunkId: ChunkId): Chunk {
    const probablyChunk = this.byKey.get(chunkId.key);
    if (probablyChunk === undefined) {
      const chunk = new Chunk(chunkId);
      this.byKey.set(chunkId.key, chunk);
      return chunk;
    }
    return probablyChunk;
  }

  public updateSegment(chunkId: ChunkId, segment: ChunkSegment) {
    const chunk = this.obtain(chunkId);
    chunk.segment = segment;
  }
}

export const chunkManagerService = registerService({
  async provider(): Promise<ChunkManager> {
    return new ChunkManager();
  },
  singleton: true,
});
