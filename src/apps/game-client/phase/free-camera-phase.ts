import { ServiceResolver } from "../../../common/dependency/service.ts";
import { provideFreeCameraController } from "../camera/free-camera-controller.ts";
import { provideDebugController } from "../../../actions/debug/debug-controller.ts";
import { PhaseConnector } from "./phase.ts";

export function provideFreeCameraPhase(resolver: ServiceResolver) {
  const phase = new PhaseConnector("free-camera");
  phase.loopers.push(resolver.resolve(provideFreeCameraController));
  phase.kaShortCutsCheckers.push(resolver.resolve(provideDebugController));
  return phase;
}
