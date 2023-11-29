import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { Viewport, viewportService } from "../graphic/Viewport.ts";
import { Camera } from "./CameraManager.ts";

export class FollowingMePlayerCamera implements Camera {
  public constructor(
    public readonly viewport: Viewport,
  ) {}

  public loop(): void {
    this.viewport.lookAt(0, 0);
  }
}

export const followingMePlayerCameraService = registerService({
  name: "followingMePlayerCamera",
  async provider(resolver: ServiceResolver): Promise<FollowingMePlayerCamera> {
    return new FollowingMePlayerCamera(
      await resolver.resolve(viewportService),
    );
  },
});
