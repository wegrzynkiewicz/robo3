import { CornerRectangle } from "../../math/CornerRectangle.ts";
import { BinaryBYOBCodec } from "../codec.ts";
import { PIXELS_PER_CHUNK_GRID_AXIS } from "../vars.ts";

export class ChunkId {

  public constructor(
    public readonly spaceId: number,
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
  ) { }

  public getWorldSpaceCornerRect(): CornerRectangle {
    const x1 = this.x * PIXELS_PER_CHUNK_GRID_AXIS;
    const y1 = this.y * PIXELS_PER_CHUNK_GRID_AXIS;
    const x2 = x1 + PIXELS_PER_CHUNK_GRID_AXIS;
    const y2 = y1 + PIXELS_PER_CHUNK_GRID_AXIS;
    return { x1, y1, x2, y2 };
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

  public static fromHex(hex: string) {
    const spaceId = parseInt(hex.substring(0, 8), 16);
    const z = parseInt(hex.substring(8, 12), 16);
    const y = parseInt(hex.substring(12, 16), 16);
    const x = parseInt(hex.substring(16, 20), 16);
    return new ChunkId(spaceId, x, y, z);
  }
}

export const chunkIdCodec: BinaryBYOBCodec<ChunkId> = {
  calcByteLength(): number {
    return 12;
  },
  decode(buffer: ArrayBuffer, byteOffset: number): ChunkId {
    const dv = new DataView(buffer, byteOffset);
    const spaceId = dv.getUint32(0, true);
    const z = dv.getUint16(4, true);
    const y = dv.getUint16(6, true);
    const x = dv.getUint16(8, true);
    const chunkId = new ChunkId(spaceId, x, y, z);
    return chunkId;
  },
  encode(buffer: ArrayBuffer, byteOffset: number, data: ChunkId): void {
    const { spaceId, x, y, z } = data;
    const dv = new DataView(buffer, byteOffset);
    dv.setUint32(0, spaceId, true);
    dv.setUint16(4, z, true);
    dv.setUint16(6, y, true);
    dv.setUint16(8, x, true);
  },
};
