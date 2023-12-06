import { assertEqual } from "../utils/asserts.ts";
import { registerIdentifier } from "../../core/identifier.ts";
import { TILES_PER_CHUNK_GRID } from "../../core/vars.ts";

const identifier = registerIdentifier({
  key: 0x11,
  kind: "chunk-segment-header",
});

export class ChunkSegmentHeader {
  public static readonly HEADER_ID = identifier.key;
  public static readonly BYTE_LENGTH = 8;

  public constructor(
    public readonly itemCount: number,
  ) {}

  public toDataView(dv: DataView): void {
    const { itemCount } = this;
    dv.setUint32(0, ChunkSegmentHeader.HEADER_ID, true);
    dv.setUint32(4, itemCount, true);
  }

  public static fromDataView(dv: DataView): ChunkSegmentHeader {
    const id = dv.getUint32(0, true);
    assertEqual(id, ChunkSegmentHeader.HEADER_ID, "invalid-header-id-in-buffer");
    const itemCount = dv.getUint32(4, true);
    return new ChunkSegmentHeader(itemCount);
  }
}

// export const chunkSegmentIdentifier = registerIdentifier({
//   key: 0x11,
//   kind: "chunk-segment-header",
// });

// export interface ChunkSegmentHeader {
//   readonly gridBitMask: number;
//   readonly itemCount: number;
// }

// export const chunkSegmentHeaderCodec: BinaryBYOBCodec<ChunkSegmentHeader> = {
//   calcByteLength(): number {
//     return 12;
//   },
//   decode(buffer: ArrayBuffer, byteOffset: number): ChunkSegmentHeader {
//     const dv = new DataView(buffer, byteOffset);
//     const key = dv.getUint32(0, true);
//     assertEqual(key, chunkSegmentIdentifier.key, "invalid-chunk-segment-header-id-in-buffer");
//     const itemCount = dv.getUint32(4, true);
//     const gridBitMask = dv.getUint32(8, true);
//     return { gridBitMask, itemCount };
//   },
//   encode(buffer: ArrayBuffer, byteOffset: number, data: ChunkSegmentHeader): void {
//     const { gridBitMask, itemCount } = data;
//     const dv = new DataView(buffer, byteOffset);
//     dv.setUint32(0, chunkSegmentIdentifier.key, true);
//     dv.setUint32(4, itemCount, true);
//     dv.setUint32(8, gridBitMask, true);
//   },
// };

export class ChunkSegmentList {
  public static readonly ITEM_BYTE_LENGTH = 8;

  public readonly byteLength: number;
  public readonly view: Uint32Array;

  public constructor(
    buffer: ArrayBuffer,
    public byteOffset: number,
    public count: number,
  ) {
    this.byteLength = ChunkSegmentList.calcByteLength(count);
    this.view = new Uint32Array(buffer, byteOffset, count * 2);
  }

  public static calcByteLength(count: number): number {
    return count * ChunkSegmentList.ITEM_BYTE_LENGTH;
  }

  public read(index: number): [number, number] {
    const currentIndex = index * 2;
    const goTypeId = this.view[currentIndex + 0];
    const position = this.view[currentIndex + 1];
    return [goTypeId, position];
  }

  public write(index: number, goTypeId: number, position: number) {
    const currentIndex = index * 2;
    this.view[currentIndex + 0] = goTypeId;
    this.view[currentIndex + 1] = position;
  }
}

export class ChunkSegmentGrid {
  public static readonly ITEM_COUNT = TILES_PER_CHUNK_GRID;
  public static readonly ITEM_BYTE_LENGTH = 2;
  public static readonly BYTE_LENGTH = ChunkSegmentGrid.ITEM_COUNT * ChunkSegmentGrid.ITEM_BYTE_LENGTH;

  public readonly view: Uint16Array;

  public constructor(
    buffer: ArrayBuffer,
    byteOffset: number,
  ) {
    this.view = new Uint16Array(buffer, byteOffset, ChunkSegmentGrid.ITEM_COUNT);
  }

  public read(index: number): number {
    return this.view[index];
  }

  public write(index: number, goTypeId: number) {
    this.view[index] = goTypeId;
  }
}

export class ChunkSegment {
  public readonly byteLength: number;
  public readonly view: Uint8Array;

  protected constructor(
    public readonly buffer: ArrayBuffer,
    public readonly byteOffset: number,
    public readonly header: ChunkSegmentHeader,
    public readonly grid: ChunkSegmentGrid,
    public readonly list: ChunkSegmentList,
  ) {
    this.byteLength = ChunkSegment.calcByteLength(list.count);
    this.view = new Uint8Array(buffer, byteOffset, this.byteLength);
  }

  public static calcByteLength(itemCount: number): number {
    const byteLength = +(ChunkSegmentHeader.BYTE_LENGTH) +
      (ChunkSegmentGrid.BYTE_LENGTH) +
      (ChunkSegmentList.calcByteLength(itemCount));
    return byteLength;
  }

  public static createFromBuffer(buffer: ArrayBuffer, byteOffset: number): ChunkSegment {
    const dv = new DataView(buffer, byteOffset);
    const header = ChunkSegmentHeader.fromDataView(dv);
    return this.createSegment(buffer, byteOffset, header);
  }

  public static createEmpty(itemCount: number): ChunkSegment {
    const byteLength = ChunkSegment.calcByteLength(itemCount);
    const buffer = new ArrayBuffer(byteLength);
    const dv = new DataView(buffer, 0);
    const header = new ChunkSegmentHeader(itemCount);
    header.toDataView(dv);
    return this.createSegment(buffer, 0, header);
  }

  protected static createSegment(buffer: ArrayBuffer, byteOffset: number, header: ChunkSegmentHeader): ChunkSegment {
    let offset = byteOffset;
    offset += ChunkSegmentHeader.BYTE_LENGTH;
    const grid = new ChunkSegmentGrid(buffer, offset);
    offset += ChunkSegmentGrid.BYTE_LENGTH;
    const list = new ChunkSegmentList(buffer, offset, header.itemCount);
    return new ChunkSegment(buffer, byteOffset, header, grid, list);
  }
}
