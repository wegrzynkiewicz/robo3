import { ChunkId } from "../chunk/chunkId.ts";
import { Position } from "../numbers.ts";
import { POSITIONS_SAMPLING_PER_CHUNK_AXIS, PIXELS_PER_CHUNK_GRID_AXIS, LAYERS_PER_CHUNK } from "../vars.ts";

export class GONormChunkPosition implements Position {
  public static readonly X_BITMASK = 0b00000000_00000000_00111111_11111111;
  public static readonly Y_BITMASK = 0b00001111_11111111_11000000_00000000;
  public static readonly Z_BITMASK = 0b11110000_00000000_00000000_00000000;

  protected constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly index: number,
  ) {
  }

  public toChunkPosition(): Position {
    const x = this.x * PIXELS_PER_CHUNK_GRID_AXIS;
    const y = this.y * PIXELS_PER_CHUNK_GRID_AXIS;
    const z = this.z;
    return { x, y, z };
  }

  public toSpacePosition(chunkId: ChunkId): Position {
    const x = chunkId.x * PIXELS_PER_CHUNK_GRID_AXIS + this.x * PIXELS_PER_CHUNK_GRID_AXIS;
    const y = chunkId.y * PIXELS_PER_CHUNK_GRID_AXIS + this.y * PIXELS_PER_CHUNK_GRID_AXIS;
    const z = chunkId.z * LAYERS_PER_CHUNK + this.z;
    return { x, y, z };
  }

  public static fromChunkPositionIndex(index: number): GONormChunkPosition {
    const x = ((GONormChunkPosition.X_BITMASK & index) >> 0) / POSITIONS_SAMPLING_PER_CHUNK_AXIS;
    const y = ((GONormChunkPosition.Y_BITMASK & index) >> 14) / POSITIONS_SAMPLING_PER_CHUNK_AXIS;
    const z = ((GONormChunkPosition.Z_BITMASK & index) >> 28);
    return new GONormChunkPosition(x, y, z, index);
  }

  public static fromChunkPosition(
    chunkPositionX: number,
    chunkPositionY: number,
    chunkPositionZ: number,
    ratio: number = PIXELS_PER_CHUNK_GRID_AXIS
  ): GONormChunkPosition {
    const normX = chunkPositionX / ratio;
    const normY = chunkPositionY / ratio;
    const normZ = chunkPositionZ;
    const x = Math.floor(normX * POSITIONS_SAMPLING_PER_CHUNK_AXIS);
    const y = Math.floor(normY * POSITIONS_SAMPLING_PER_CHUNK_AXIS);
    const z = normZ;
    const index = 0
      | GONormChunkPosition.X_BITMASK & (x << 0)
      | GONormChunkPosition.Y_BITMASK & (y << 14)
      | GONormChunkPosition.Z_BITMASK & (z << 28);
    return new GONormChunkPosition(normX, normY, z, index);
  }
}
