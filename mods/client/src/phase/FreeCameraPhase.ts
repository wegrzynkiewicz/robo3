import { registerService } from "../../../core/dependency/service.ts";
import { AnyUADefinition } from "../ua/foundation.ts";
import { debugActions } from "./actions.ts";

export class FreeCameraPhase {
  public getAvailableUADefinition(): AnyUADefinition[] {
    return [
      ...debugActions,
    ];
  }
}

export const freeCameraPhaseService = registerService({
  async provider(): Promise<FreeCameraPhase> {
    return new FreeCameraPhase();
  },
});
