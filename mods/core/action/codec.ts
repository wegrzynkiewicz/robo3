import { assertObject, assertPositiveNumber, assertRequiredString } from "../../common/asserts.ts";

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

export type WithKind<TData> = { kind: string } & TData

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
