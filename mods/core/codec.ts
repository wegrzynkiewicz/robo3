export interface BinaryDecoder<TData> {
  decode(buffer: ArrayBuffer, byteOffset: number): TData;
}

export interface BinaryEncoder<TData> {
  encode(data: TData): ArrayBuffer;
}

export type BinaryCodec<TData> = BinaryDecoder<TData> & BinaryEncoder<TData>;

export interface BinaryBYOBEncoder<TData> {
  calcByteLength(data?: TData): number;
  encode(buffer: ArrayBuffer, byteOffset: number, data: TData): void;
}

export type BinaryBYOBCodec<TData> = BinaryDecoder<TData> & BinaryBYOBEncoder<TData>;

export interface JsonDecoder<TData> {
  decode(data: unknown): TData;
}

export interface JsonEncoder<TData> {
  encode(data: TData): string;
}

export type JsonCodec<TData> = JsonDecoder<TData> & JsonEncoder<TData>;

function align(byteLength: number): number {
  return Math.ceil(byteLength / 4) * 4;
}

export class BinarySequencyDecoder {
  public constructor(
    protected buffer: ArrayBuffer,
    protected byteOffset: number,
  ) {
  }

  public decode<TData>(codec: BinaryBYOBCodec<TData>): TData {
    const { buffer, byteOffset } = this;
    const data = codec.decode(buffer, byteOffset);
    const byteLength = codec.calcByteLength(data);
    this.byteOffset += align(byteLength);
    return data;
  }
}

export class BinarySequencyEncoder {
  public constructor(
    protected buffer: ArrayBuffer,
    protected byteOffset: number,
  ) {
  }

  public encode<TData>(codec: BinaryBYOBCodec<TData>, data: TData): void {
    const byteLength = codec.calcByteLength(data);
    codec.encode(this.buffer, this.byteOffset, data);
    this.byteOffset += align(byteLength);
  }
}
