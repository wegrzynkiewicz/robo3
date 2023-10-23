import { Breaker } from "../../common/asserts.ts";
import { ChunkDTO } from "../../core/chunk/chunk.ts";
import { ChunkId } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";
import { registerService } from "../../core/dependency/service.ts";
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

  public processGO() {
    this.transparent = false;
    if (this.segment === undefined) {
      return;
    }
  }
}

export class ChunkManager {
  public readonly byPositionIndex = new Map<number, Chunk>();
  public readonly chunks = new Map<string, Chunk>();

  public getByCoords(x: number, y: number, z: number): Chunk | undefined {
    const index = z * 4294967296 + y * 65536 + x
    const chunk = this.byPositionIndex.get(index);
    return chunk;
  } 

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
    chunk.processGO();
  }
}

export const chunkManagerService = registerService({
  provider: async () => (new ChunkManager()),
  singleton: true,
});
