import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { freeCameraControllerService } from "../camera/FreeCameraController.ts";
import { debugControllerService } from "../debug/DebugController.ts";
import { PhaseConnector } from "./Phase.ts";

export function providePhaseConnector(resolver: ServiceResolver) {
  const phase = new PhaseConnector("free-camera");
  phase.loopers.push(resolver.resolve(provideFreeCameraController));
  phase.kaShortCutsCheckers.push(resolver.resolve(provideDebugController));
  return phase;
}
