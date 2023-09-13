import { Breaker } from "../../common/asserts.ts";
import { ChunkDTO } from "../../core/chunk/chunk.ts";
import { ChunkId } from "../../core/chunk/chunkId.ts";
import { ChunkSegment } from "../../core/chunk/chunkSegment.ts";
import { registerService } from "../../core/dependency/service.ts";
import { GONormChunkPosition } from "../../core/game-object/position.ts";
import { Position } from "../../core/numbers.ts";
import { TILES_PER_CHUNK_GRID_AXIS } from "../../core/vars.ts";
import { CornerRectangle, cornerRect } from "../../math/CornerRectangle.ts";

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
  public gos: GOView[] = [];
  public readonly worldSpaceRect: CornerRectangle;
  public readonly worldSpaceBoundRect: CornerRectangle;
  public constructor(
    public chunkId: ChunkId,
  ) {
    this.worldSpaceRect = this.chunkId.getWorldSpaceCornerRect();
    this.worldSpaceBoundRect = {...this.worldSpaceRect};
  }

  public processGO() {
    if (this.segment === undefined) {
      return;
    }
    let maxX = this.worldSpaceRect.x2;
    let maxY = this.worldSpaceRect.y2;
    const gridView = this.segment.grid.view;
    let localId = 0;
    for (let y = 0; y < TILES_PER_CHUNK_GRID_AXIS; y++) {
      for (let x = 0; x < TILES_PER_CHUNK_GRID_AXIS; x++) {
        const goTypeId = gridView[localId];
        const normChunkPosition = GONormChunkPosition.fromChunkPosition(x, y, 0, TILES_PER_CHUNK_GRID_AXIS);
        const chunkPosition = normChunkPosition.toChunkPosition();
        const spacePosition = normChunkPosition.toSpacePosition(this.chunkId);
        const worldSpaceRect = cornerRect(
          spacePosition.x,
          spacePosition.y,
          spacePosition.x + 32,
          spacePosition.y + 32,
        );
        const goView: GOView = { normChunkPosition, chunkPosition, goTypeId, localId, spacePosition, worldSpaceRect };
        this.gos.push(goView);
        localId++;
      }
    }
    const { count, view: listView } = this.segment.list;
    for (let i = 0; i < count; i++) {
      const goTypeId = listView[i * 2 + 0];
      const position = listView[i * 2 + 1];
      const normChunkPosition = GONormChunkPosition.fromChunkPositionIndex(position);
      const chunkPosition = normChunkPosition.toChunkPosition();
      const spacePosition = normChunkPosition.toSpacePosition(this.chunkId);
      const worldSpaceRect = cornerRect(
        spacePosition.x,
        spacePosition.y,
        spacePosition.x + 32,
        spacePosition.y + 32,
      );
      maxX = Math.max(worldSpaceRect.x2,  maxX);
      maxY = Math.max(worldSpaceRect.y2,  maxY);
      const goView: GOView = { normChunkPosition, chunkPosition, goTypeId, localId, spacePosition, worldSpaceRect };
      this.gos.push(goView);
      localId++;
    }
    this.worldSpaceBoundRect.x2 = maxX;
    this.worldSpaceBoundRect.y2 = maxY;
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
    chunk.processGO();
  }
}

export const chunkManagerService = registerService({
  provider: async () => (new ChunkManager()),
  singleton: true,
});
