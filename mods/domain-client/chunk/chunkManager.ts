import { ChunkId } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";
import { GONormChunkPosition } from "../../core/game-object/position.ts";
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
  public readonly byPositionIndex = new Map<number, Chunk>();

  public getByCoords(x: number, y: number, z: number): Chunk | undefined {
    const index = z * 4294967296 + y * 65536 + x
    const chunk = this.byPositionIndex.get(index);
    return chunk;
  }

  public obtain(chunkId: ChunkId): Chunk {
    const index = chunkId.toSpacePosIndex();
    const probablyChunk = this.byPositionIndex.get(index);
    if (probablyChunk === undefined) {
      const chunk = new Chunk(chunkId);
      this.byPositionIndex.set(index, chunk);
      return chunk;
    }
    return probablyChunk;
  }

  public updateSegment(chunkId: ChunkId, segment: ChunkSegment) {
    const chunk = this.obtain(chunkId);
    chunk.segment = segment;
  }
}
