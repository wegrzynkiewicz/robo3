import { ServiceResolver } from "../../common/dependency/service.ts";
import { KeyShortCut, KeyState } from "../../apps/game-client/keyboard/key-short-cut.ts";
import { registerKADefinition } from "../../apps/game-client/keyboard/foundation.ts";
import { provideFreeCameraPhase } from "../../apps/game-client/phase/free-camera-phase.ts";
import { provideGamePhase } from "../../apps/game-client/phase/game-phase.ts";
import { PhaseController } from "../../apps/game-client/phase/phase.ts";
import { PhaseManager, providePhaseManager } from "../../apps/game-client/phase/phase-manager.ts";
import { registerUADefinition, UADefinition } from "../../apps/game-client/ua/foundation.ts";
import { UAHandler } from "../../apps/game-client/ua/processor.ts";
import { debugKeyShortCut } from "./common.ts";

export const debugSwitchFreeCameraUA = registerUADefinition<null>({
  name: "ua.debug.switch-free-camera",
});

export const debugSwitchFreeCameraKA = registerKADefinition({
  name: "ka.debug.switch-free-camera",
  shortCuts: [
    new KeyShortCut(
      ...debugKeyShortCut,
      new KeyState("KeyF"),
    ),
  ],
  ua: {
    data: null,
    definition: debugSwitchFreeCameraUA,
  },
});

export class DebugSwitchFreeCameraUAHandler implements UAHandler<null> {
  public constructor(
    protected phaseManager: PhaseManager,
    protected freeGamePhase: PhaseController,
    protected gamePhase: PhaseController,
  ) {}

  public async handle(_definition: UADefinition<null>, _data: null): Promise<void> {
    this.phaseManager.setCurrentPhase(this.getPhase());
  }

  public getPhase(): PhaseController {
    const currentPhase = this.phaseManager.currentPhase;
    if (currentPhase === this.freeGamePhase) {
      return this.gamePhase;
    }
    if (currentPhase === this.gamePhase) {
      return this.freeGamePhase;
    }
    return currentPhase;
  }
}

export function provideDebugSwitchFreeCameraUAHandler(resolver: ServiceResolver) {
  return new DebugSwitchFreeCameraUAHandler(
    resolver.resolve(providePhaseManager),
    resolver.resolve(provideGamePhase),
    resolver.resolve(provideFreeCameraPhase),
  );
}
