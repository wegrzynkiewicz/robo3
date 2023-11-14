import { CornerRectangle } from "../../math/CornerRectangle.ts";
import { BinaryBYOBCodec } from "../codec.ts";
import { PIXELS_PER_CHUNK_GRID_AXIS } from "../vars.ts";

function toHex(number: number, pad: number): string {
  return number.toString(16).padStart(pad, "0");
}

function chunkScalarsToHex(spaceId: number, x: number, y: number, z: number): string {
  return `${toHex(spaceId, 8)}${toHex(x, 4)}${toHex(y, 4)}${toHex(z, 4)}`;
}

export class ChunkId {

  protected constructor(
    public readonly key: string,
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

  public static fromScalars(spaceId: number, x: number, y: number, z: number) {
    const key = chunkScalarsToHex(spaceId, x, y, z);
    const chunkId = new ChunkId(key, spaceId, x, y, z);
    return chunkId;
  }

  public static fromHex(key: string) {
    const spaceId = parseInt(key.substring(0, 8), 16);
    const z = parseInt(key.substring(8, 12), 16);
    const y = parseInt(key.substring(12, 16), 16);
    const x = parseInt(key.substring(16, 20), 16);
    const chunkId = new ChunkId(key, spaceId, x, y, z);
    return chunkId;
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
    const chunkId = ChunkId.fromScalars(spaceId, x, y, z);
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
