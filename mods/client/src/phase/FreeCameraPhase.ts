import { ServiceResolver, registerService } from "../../../dependency/service.ts";
import { freeViewportControllerService } from "../camera/FreeViewportController.ts";
import { debugControllerService } from "../debug/DebugController.ts";
import { PhaseConnector } from "./Phase.ts";

export const freeCameraPhaseService = registerService({
  name: 'freeCameraPhase',
  async provider(resolver: ServiceResolver): Promise<PhaseConnector> {
    const phase = new PhaseConnector('free-camera');
    phase.loopers.push(await resolver.resolve(freeViewportControllerService));
    phase.kaShortCutCheckers.push(await resolver.resolve(debugControllerService));
    return phase;
  },
});
