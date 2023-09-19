import { registerService } from "../../../core/dependency/service.ts";
import { debugDisplayScaleUA } from "../debug/debugDisplayScaleUA.ts";
import { debugOpenInfoUA } from "../debug/debugOpenInfoUA.ts";
import { AnyUADefinition } from "../ua/foundation.ts";

export class GamePhase {
  public getAvailableUADefinition(): AnyUADefinition[] {
    return [
      debugOpenInfoUA,
      debugDisplayScaleUA,
    ];
  }
}

export const gamePhaseService = registerService({
  async provider(): Promise<GamePhase> {
    return new GamePhase();
  },
});
