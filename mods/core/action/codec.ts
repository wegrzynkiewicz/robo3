import { assertObject, assertPositiveNumber, assertRequiredString } from "../../common/asserts.ts";
import { BinarySerializable } from "../../common/binary.ts";

export interface GAEnvelope<TData> {
  id: number;
  kind: string;
  params: TData;
}

export type AnyGAEnvelope = GAEnvelope<any>;

export interface GACodec<TData> {
  decode(data: unknown): GAEnvelope<TData>;
  encode(envelope: GAEnvelope<TData>): string | ArrayBuffer;
}

export type AnyGACodec = GACodec<any>;

export function decodeGAJsonEnvelope(message: string): AnyGAEnvelope {
  const envelope = JSON.parse(message);
  assertObject<AnyGAEnvelope>(envelope, "invalid-game-action-envelope");
  const { id, kind, params } = envelope;
  assertPositiveNumber(id, "invalid-game-action-envelope-id");
  assertRequiredString(kind, "invalid-game-action-envelope-kind");
  assertObject(params, "invalid-game-action-envelope-params");
  return { id, kind, params };
}

export class GAJsonCodec<TData> implements GACodec<TData> {
  decode(data: unknown): GAEnvelope<TData> {
    return data as GAEnvelope<TData>;
  }

  encode(data: GAEnvelope<TData>): string {
    return JSON.stringify(data);
  }
}

export class GABinaryHeader implements BinarySerializable {
  public static readonly BYTE_LENGTH = 8;

  public constructor(
    public readonly key: number,
    public readonly id: number,
  ) {
  }

  public toDataView(dv: DataView): void {
    dv.setUint32(0, this.key, true);
    dv.setUint32(4, this.id, true);
  }

  public static fromDataView(dv: DataView): GABinaryHeader {
    const key = dv.getUint32(0, true);
    const id = dv.getUint32(4, true);
    return new GABinaryHeader(key, id);
  }
}

export function align(byteLength: number): number {
  return Math.ceil(byteLength / 4) * 4;
}
