import { assertObject, assertPositiveNumber, assertRequiredString, Breaker } from "../../common/asserts.ts";
import { BinarySerializable, compress, decompress, toArrayBuffer } from "../../common/binary.ts";
import { GADefinition, GAEnvelope, GAHeader, GAKind } from "./foundation.ts";

export interface GACodec<TData> {
  decode(definition: GADefinition, header: GAHeader, data: unknown): Promise<TData>;
  encode(definition: GADefinition, header: GAHeader, data: TData): Promise<string | ArrayBuffer>;
}

export interface GATransformator<TData> {
  normalize?: (params: TData) => unknown;
  parse(data: unknown): TData;
}

const allowedActionKinds = ["err", "not", "req", "res"];

export function decodeGAJsonEnvelope(data: string): GAEnvelope<unknown> {
  const envelope = JSON.parse(data);
  assertObject<GAEnvelope<unknown>>(envelope, "invalid-game-action-envelope");
  const { code, id, params, kind } = envelope;
  assertPositiveNumber(id, "invalid-game-action-envelope-id");
  assertObject(params, "invalid-game-action-envelope-params");
  assertRequiredString(code, "invalid-game-action-envelope-code");
  assertRequiredString(kind, "invalid-game-action-envelope-kind");
  if (!allowedActionKinds.includes(kind)) {
    throw new Breaker("invalid-game-action-envelope-kind", { kind });
  }
  return { code, id, kind, params };
}

export class GAJsonCodec<TData> implements GACodec<TData> {
  public constructor(
    public transformator?: GATransformator<TData>,
  ) {
  }

  async decode(_definition: GADefinition, _header: GAHeader, data: unknown): Promise<TData> {
    const params = (this.transformator?.parse(data)) ?? data;
    return params as TData;
  }

  async encode(_definition: GADefinition, header: GAHeader, data: TData): Promise<string> {
    const params = (this.transformator?.normalize?.(data)) || data;
    const envelope: GAEnvelope<unknown> = { ...header, params };
    return JSON.stringify(envelope);
  }
}

export class GABinaryHeader implements BinarySerializable {
  public static readonly BYTE_LENGTH = 12;

  public constructor(
    public readonly kind: GAKind,
    public readonly index: number,
    public readonly id: number,
  ) {
  }

  public toDataView(dv: DataView): void {
    dv.setUint32(0, allowedActionKinds.indexOf(this.kind), true);
    dv.setUint32(4, this.index, true);
    dv.setUint32(8, this.id, true);
  }

  public static fromDataView(dv: DataView): GABinaryHeader {
    const kind = allowedActionKinds[dv.getUint32(0, true)];
    assertPositiveNumber(kind, "invalid-kind-of-serialized-game-action-envelope-binary-header");
    const index = dv.getUint16(4, true);
    const id = dv.getUint16(8, true);
    return new GABinaryHeader(kind, index, id);
  }
}

export interface GABinarySubCodec<TData> {
  calcBufferSize(params: TData): number;
  decode(buffer: ArrayBuffer, byteOffset: number): TData;
  encode(buffer: ArrayBuffer, byteOffset: number, params: TData): void;
}

export class GABinaryCodec<TData> implements GACodec<TData> {
  public constructor(
    public subCodec: GABinarySubCodec<TData>,
  ) {
  }

  async decode(definition: GADefinition, _header: GAHeader, buffer: TData): Promise<TData> {
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Breaker("unexpected-value-in-game-action-codec", { definition });
    }
    const params = this.subCodec.decode(buffer, GABinaryHeader.BYTE_LENGTH);
    return params;
  }

  async encode(definition: GADefinition, header: GAHeader, params: TData): Promise<ArrayBuffer> {
    const { id, kind } = header;
    const byteOffset = GABinaryHeader.BYTE_LENGTH;
    const totalLength = byteOffset + this.subCodec.calcBufferSize(params);
    const buffer = new ArrayBuffer(totalLength);
    const binary = new GABinaryHeader(kind, definition.index, id);
    toArrayBuffer(buffer, 0, binary);
    this.subCodec.encode(buffer, byteOffset, params);
    return buffer;
  }
}


export class GACompressorCodec<TData> implements GACodec<TData> {
  public constructor(
    public subCodec: GABinarySubCodec<TData>,
  ) {
  }

  async decode(definition: GADefinition, _header: GAHeader, buffer: TData): Promise<TData> {
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Breaker("unexpected-value-in-game-action-codec", { definition });
    }
    const view = new Uint8Array(buffer, GABinaryHeader.BYTE_LENGTH);
    const decompressedBuffer = await decompress(view);
    const params = this.subCodec.decode(decompressedBuffer, 0);
    return params;
  }

  async encode(definition: GADefinition, header: GAHeader, params: TData): Promise<ArrayBuffer> {
    const { id, kind } = header;
    const uncompressedLength = this.subCodec.calcBufferSize(params);
    const uncompressedBuffer = new ArrayBuffer(uncompressedLength);
    this.subCodec.encode(uncompressedBuffer, 0, params);
    const view = new Uint8Array(uncompressedBuffer);
    const compressedBuffer = await compress(view);
    const compressedView = new Uint8Array(compressedBuffer);
    const totalLength = compressedBuffer.byteLength + GABinaryHeader.BYTE_LENGTH;
    const buffer = new ArrayBuffer(totalLength);
    const binary = new GABinaryHeader(kind, definition.index, id);
    toArrayBuffer(buffer, 0, binary);
    (new Uint8Array(buffer, GABinaryHeader.BYTE_LENGTH, totalLength)).set(compressedView);
    return buffer;
  }
}
