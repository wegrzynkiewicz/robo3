import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { KeyShortCut, KeyState } from "../../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../../keyboard/foundation.ts";
import { freeCameraPhaseService } from "../../phase/FreeCameraPhase.ts";
import { gamePhaseService } from "../../phase/GamePhase.ts";
import { PhaseController } from "../../phase/Phase.ts";
import { PhaseManager } from "../../phase/PhaseManager.ts";
import { phaseManagerService } from "../../phase/PhaseManager.ts";
import { registerUADefinition, UADefinition } from "../../ua/foundation.ts";
import { UAHandler } from "../../ua/processor.ts";
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

export const debugSwitchFreeCameraUAHandlerService = registerService({
  name: "debugSwitchFreeCameraUAHandler",
  async provider(resolver: ServiceResolver): Promise<UAHandler<null>> {
    return new DebugSwitchFreeCameraUAHandler(
      await resolver.resolve(phaseManagerService),
      await resolver.resolve(gamePhaseService),
      await resolver.resolve(freeCameraPhaseService),
    );
  },
});
