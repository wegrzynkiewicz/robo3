import { GADispatcher } from "../../../common/action/define.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { Breaker } from "../../../common/utils/breaker.ts";

export interface PlayerContext {
  dispatcher: GADispatcher;
  playerContextId: number;
  resolver: ServiceResolver;
}

export function provideScopedPlayerContext(): PlayerContext {
  throw new Breaker('player-context-must-be-injected');
}
