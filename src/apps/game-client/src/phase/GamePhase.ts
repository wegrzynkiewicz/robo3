import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { provideFollowingMePlayerCamera } from "../camera/FollowingMePlayerCamera.ts";
import { provideMePlayerController } from "../camera/MePlayerController.ts";
import { provideDebugController } from "../debug/DebugController.ts";
import { PhaseConnector } from "./Phase.ts";

export function provideGamePhase(resolver: ServiceResolver) {
  const phase = new PhaseConnector("game");
  phase.kaShortCutsCheckers.push(resolver.resolve(provideDebugController));
  phase.loopers.push(resolver.resolve(provideFollowingMePlayerCamera));
  phase.loopers.push(resolver.resolve(provideMePlayerController));
  return phase;
}
