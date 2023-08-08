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
export type GameActionEnvelopeKind = GameActionEnvelope["kind"];
export type GameActionResult = GameActionResponse | GameActionError;
export type GameActionCause = GameActionRequest | GameActionNotification;

export interface GameAction<TParam> {
  readonly code: string;
  readonly params: TParam;
}
