import { registerService } from "../../../dependency/service.ts";
import { AnyUADefinition } from "../ua/foundation.ts";
import { debugActions } from "./actions.ts";

export class GamePhase {
  public getAvailableUADefinition(): AnyUADefinition[] {
    return [
      ...debugActions,
    ];
  }
}

export const gamePhaseService = registerService({
  async provider(): Promise<GamePhase> {
    return new GamePhase();
  },
});
