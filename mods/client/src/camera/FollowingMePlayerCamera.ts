import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { MyPlayer, myPlayerService } from "../../../domain-client/player-move/MyPlayer.ts";
import { Viewport, viewportService } from "../graphic/Viewport.ts";
import { Camera } from "./CameraManager.ts";

export class FollowingMePlayerCamera implements Camera {
  public constructor(
    public readonly viewport: Viewport,
    public readonly myPlayer: MyPlayer,
  ) {}

  public loop(): void {
    const { x, y } = this.myPlayer.being;
    this.viewport.lookAt(x, y);
  }
}

export const followingMePlayerCameraService = registerService({
  name: "followingMePlayerCamera",
  async provider(resolver: ServiceResolver): Promise<FollowingMePlayerCamera> {
    return new FollowingMePlayerCamera(
      await resolver.resolve(viewportService),
      await resolver.resolve(myPlayerService),
    );
  },
});
