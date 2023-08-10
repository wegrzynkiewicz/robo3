import { Position } from "../numbers.ts";

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
    dv.setUint32(0, spaceId);
    dv.setUint16(4, z);
    dv.setUint16(6, y);
    dv.setUint16(8, x);
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

  public static fromDataView(dv: DataView): ChunkId {
    const spaceId = dv.getUint32(0);
    const z = dv.getUint16(4);
    const y = dv.getUint16(6);
    const x = dv.getUint16(8);
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
