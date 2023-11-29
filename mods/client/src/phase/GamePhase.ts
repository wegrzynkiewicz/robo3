import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { followingMePlayerCameraService } from "../camera/FollowingMePlayerCamera.ts";
import { mePlayerControllerService } from "../camera/MePlayerController.ts";
import { debugControllerService } from "../debug/DebugController.ts";
import { PhaseConnector } from "./Phase.ts";

export const gamePhaseService = registerService({
  name: "gamePhase",
  async provider(resolver: ServiceResolver): Promise<PhaseConnector> {
    const phase = new PhaseConnector("game");
    phase.kaShortCutCheckers.push(await resolver.resolve(debugControllerService));
    phase.loopers.push(await resolver.resolve(followingMePlayerCameraService));
    phase.loopers.push(await resolver.resolve(mePlayerControllerService));
    return phase;
  },
});
