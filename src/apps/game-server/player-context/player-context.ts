import { GADispatcher } from "../../../common/action/define.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { Breaker } from "../../../common/utils/breaker.ts";

export interface PlayerContext {
  beingId: number;
  dispatcher: GADispatcher;
  playerContextId: number;
  resolver: ServiceResolver;
  spaceId: number;
}

export function provideScopedPlayerContext(): PlayerContext {
  throw new Breaker('player-context-must-be-injected');
}
