import { ChunkId } from "../../common/chunk/chunkId.ts";
import { ChunkSegment } from "../../common/chunk/chunkSegment.ts";
import { GONormChunkPosition } from "../../common/game-object/position.ts";

import { Box2P } from "../../common/math/Box2P.ts";
import { Pos3D } from "../../common/math/Pos3D.ts";

export interface GOView {
  chunkPosition: Pos3D;
  goTypeId: number;
  localId: number;
  normChunkPosition: GONormChunkPosition;
  spacePosition: Pos3D;
  worldSpaceRect: Box2P;
}

export class Chunk {
  public segment?: ChunkSegment;
  public readonly worldSpaceRect: Box2P;
  public readonly worldSpaceBoundRect: Box2P;
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

export function provideChunkManager() {
  return new ChunkManager();
}
