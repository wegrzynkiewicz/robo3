export interface GameActionCommon {
  code: string;
  id: number;
  params: Record<string, unknown>;
}

export interface GameActionRequest extends GameActionCommon {
  kind: "req";
}

export interface GameActionNotification extends GameActionCommon {
  kind: "not";
}

export interface GameActionError extends GameActionCommon {
  kind: "err";
}

export interface GameActionResponse extends GameActionCommon {
  kind: "res";
}

export type GameActionEnvelope = GameActionError | GameActionNotification | GameActionRequest | GameActionResponse;
export type GameActionResult = GameActionResponse | GameActionError;

export interface GameActionCodec<TParams> {
  calcBufferSize(params: TParams): number;
  decode(buffer: ArrayBuffer, byteOffset: number): TParams;
  encode(buffer: ArrayBuffer, byteOffset: number, params: TParams): void;
  index: number;
  key: string;
}
export type UnknownGameActionCodec = GameActionCodec<unknown>;

let i = 1; // TODO: make registry

export function registerGameActionCodec<TParams>(
  codec: Omit<GameActionCodec<TParams>, 'index'>
): GameActionCodec<TParams> {
  const result = {
    ...codec,
    index: i++,
  }
  return result;
}
