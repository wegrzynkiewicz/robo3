import { assertObject, assertRequiredString } from "../../common/asserts.ts";

export interface GACodec<TData> {
  decode(data: unknown): TData;
  encode(data: TData): string | ArrayBuffer;
}
export type AnyGACodec = GACodec<any>;

export type WithKind<TData> = { kind: string } & TData

export function decodeGAJsonEnvelope(message: string): WithKind<unknown> {
  const envelope = JSON.parse(message);
  assertObject<WithKind<unknown>>(envelope, "invalid-game-action-envelope");
  const { kind, ...rest } = envelope;
  assertRequiredString(kind, "invalid-game-action-envelope-kind");
  return { kind, ...rest };
}

export class GAJsonCodec<TData> implements GACodec<TData> {

  decode(data: unknown): TData {
    return data as TData;
  }

  encode(data: TData): string {
    return JSON.stringify(data);
  }
}
