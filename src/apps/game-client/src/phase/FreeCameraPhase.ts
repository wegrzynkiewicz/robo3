import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { provideFreeCameraController } from "../camera/FreeCameraController.ts";
import { provideDebugController } from "../debug/DebugController.ts";
import { PhaseConnector } from "./Phase.ts";

export function provideFreeCameraPhase(resolver: ServiceResolver) {
  const phase = new PhaseConnector("free-camera");
  phase.loopers.push(resolver.resolve(provideFreeCameraController));
  phase.kaShortCutsCheckers.push(resolver.resolve(provideDebugController));
  return phase;
}
