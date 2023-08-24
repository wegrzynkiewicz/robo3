import { Position } from "../numbers.ts";
import { LAYERS_PER_CHUNK, PIXELS_PER_CHUNK_GRID_AXIS } from "../vars.ts";

export class ChunkId {
  public static readonly BYTE_LENGTH = 10;

  public readonly position: Position;

  public constructor(
    public readonly spaceId: number,
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) {
    this.position = { x, y, z };
  }

  public toDataView(dv: DataView): void {
    const { spaceId, x, y, z } = this;
    dv.setUint32(0, spaceId, true);
    dv.setUint16(4, z, true);
    dv.setUint16(6, y, true);
    dv.setUint16(8, x, true);
  }

  public toHex(): string {
    const { spaceId, x, y, z } = this;
    const parts = [
      spaceId.toString(16).padStart(8, "0"),
      z.toString(16).padStart(4, "0"),
      y.toString(16).padStart(4, "0"),
      x.toString(16).padStart(4, "0"),
    ];
    return parts.join("");
  }

  public toSpacePosition(): Position {
    const x = this.x * PIXELS_PER_CHUNK_GRID_AXIS;
    const y = this.y * PIXELS_PER_CHUNK_GRID_AXIS;
    const z = this.z * LAYERS_PER_CHUNK;
    return { x, y, z };
  }

  public static fromDataView(dv: DataView): ChunkId {
    const spaceId = dv.getUint32(0, true);
    const z = dv.getUint16(4, true);
    const y = dv.getUint16(6, true);
    const x = dv.getUint16(8, true);
    return new ChunkId(spaceId, x, y, z);
  }

  public static fromHex(hex: string) {
    const spaceId = parseInt(hex.substring(0, 8), 16);
    const z = parseInt(hex.substring(8, 12), 16);
    const y = parseInt(hex.substring(12, 16), 16);
    const x = parseInt(hex.substring(16, 20), 16);
    return new ChunkId(spaceId, x, y, z);
  }
}
