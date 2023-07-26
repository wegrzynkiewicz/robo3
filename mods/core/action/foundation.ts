export interface GameActionRequest {
  id: number;
  params: Record<string, unknown>;
  request: string;
  type: "req";
}

export interface GameActionNotification {
  id: number;
  notify: string;
  params: Record<string, unknown>;
  type: "not";
}

export interface GameActionError {
  id: number;
  error: string;
  params: Record<string, unknown>;
  type: "err";
}

export interface GameActionResponse {
  id: number;
  params: Record<string, unknown>;
  response: string;
  type: "res";
}

export type GameActionEnvelope = GameActionError | GameActionNotification | GameActionRequest | GameActionResponse;
export type GameActionResult = GameActionResponse | GameActionError;
