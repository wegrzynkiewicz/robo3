import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { followingMePlayerCameraService } from "../camera/FollowingMePlayerCamera.ts";
import { mePlayerControllerService } from "../camera/MePlayerController.ts";
import { debugControllerService } from "../debug/DebugController.ts";
import { PhaseConnector } from "./Phase.ts";

export function providePhaseConnector(resolver: ServiceResolver) {
  const phase = new PhaseConnector("game");
  phase.kaShortCutsCheckers.push(resolver.resolve(provideDebugController));
  phase.loopers.push(resolver.resolve(provideFollowingMePlayerCamera));
  phase.loopers.push(resolver.resolve(provideMePlayerController));
  return phase;
}
