import { ServiceResolver } from "../../dependency/service.ts";
import { Breaker } from "../../utils/breaker.ts";

export interface ServerPlayerContext {
  beingId: number;
  playerContextId: number;
  resolver: ServiceResolver;
  spaceId: number;
}

export function provideScopedServerPlayerContext(): ServerPlayerContext {
  throw new Breaker('server-player-context-must-be-injected');
}
