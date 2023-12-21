import { ServiceResolver } from "../../dependency/service.ts";
import { Breaker } from "../../utils/breaker.ts";
import { GameSimulationDaemon } from "../simulation-daemon.ts";

export interface GameSimulationContext {
  resolver: ServiceResolver;
  simulator: GameSimulationDaemon;
  spaceId: number;
}

export function provideScopedGameSimulationContext(): GameSimulationContext {
  throw new Breaker('game-simulator-context-must-be-injected');
}
