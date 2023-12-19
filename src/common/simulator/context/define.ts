import { ServiceResolver } from "../../dependency/service.ts";
import { Breaker } from "../../utils/breaker.ts";
import { GameSimulatorDaemon } from "../game-daemon.ts";

export interface GameSimulatorContext {
  resolver: ServiceResolver;
  simulator: GameSimulatorDaemon;
  spaceId: number;
}

export function provideScopedGameSimulatorContext(): GameSimulatorContext {
  throw new Breaker('game-simulator-context-must-be-injected');
}
