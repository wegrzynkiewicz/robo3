import { ServiceResolver } from "../../../common/dependency/service.ts";
import { provideFollowingMePlayerCamera } from "../camera/following-me-player-camera.ts";
import { provideMePlayerController } from "../camera/me-player-controller.ts";
import { provideDebugController } from "../../../actions/debug/debug-controller.ts";
import { PhaseConnector } from "./phase.ts";

export function provideGamePhase(resolver: ServiceResolver) {
  const phase = new PhaseConnector("game");
  phase.kaShortCutsCheckers.push(resolver.resolve(provideDebugController));
  phase.loopers.push(resolver.resolve(provideFollowingMePlayerCamera));
  phase.loopers.push(resolver.resolve(provideMePlayerController));
  return phase;
}
