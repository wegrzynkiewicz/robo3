import { assertEqual } from "../../common/asserts.ts";
import { registerIdentifier } from "../identifier.ts";
import { TILES_PER_CHUNK_GRID } from "../vars.ts";

const identifier = registerIdentifier({
  key: 0x11,
  kind: 'chunk-segment-header',
});

export class ChunkSegmentHeader {

  public static readonly HEADER_ID = identifier.key;
  public static readonly BYTE_LENGTH = 8;

  public constructor(
    public readonly itemCount: number,
  ) {
  }

  public toDataView(dv: DataView): void {
    const { itemCount } = this;
    dv.setUint8(0, ChunkSegmentHeader.HEADER_ID);
    dv.setUint32(4, itemCount, true);
  }

  public static fromDataView(dv: DataView): ChunkSegmentHeader {
    const id = dv.getUint8(0);
    assertEqual(id, ChunkSegmentHeader.HEADER_ID, 'invalid-header-id-in-buffer');
    const itemCount = dv.getUint32(4, true);
    return new ChunkSegmentHeader(itemCount);
  }
}

export class ChunkSegmentList {
  public static readonly ITEM_BYTE_LENGTH = 8;

  public readonly byteLength: number;
  protected readonly view: Uint32Array;

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
    const byteLength =
      + (ChunkSegmentHeader.BYTE_LENGTH)
      + (ChunkSegmentGrid.BYTE_LENGTH)
      + (ChunkSegmentList.calcByteLength(itemCount));
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
