import { assertObject, assertPositiveNumber, assertRequiredString, Breaker } from "../../common/asserts.ts";
import { BinarySerializable, toArrayBuffer } from "../../common/binary.ts";
import { GADefinition, GAEnvelope, GAHeader, GAKind } from "./foundation.ts";

export interface GACodec<TData> {
  decode(definition: GADefinition, header: GAHeader, data: unknown): TData;
  encode(definition: GADefinition, header: GAHeader, data: TData): string | ArrayBuffer;
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

  decode(_definition: GADefinition, _header: GAHeader, data: unknown): TData {
    const params = (this.transformator?.parse(data)) ?? data;
    return params as TData;
  }

  encode(_definition: GADefinition, header: GAHeader, data: TData): string {
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

  decode(definition: GADefinition, _header: GAHeader, buffer: TData): TData {
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Breaker("unexpected-value-in-game-action-codec", { definition });
    }
    const params = this.subCodec.decode(buffer, GABinaryHeader.BYTE_LENGTH);
    return params;
  }

  encode(definition: GADefinition, header: GAHeader, params: TData): ArrayBuffer {
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
