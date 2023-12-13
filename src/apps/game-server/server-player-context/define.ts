import { GADispatcher } from "../../../common/action/define.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { Breaker } from "../../../common/utils/breaker.ts";

export interface ServerPlayerContext {
  beingId: number;
  dispatcher: GADispatcher;
  playerContextId: number;
  resolver: ServiceResolver;
  spaceId: number;
}

export function provideScopedServerPlayerContext(): ServerPlayerContext {
  throw new Breaker('server-player-context-must-be-injected');
}
