import { ServiceResolver } from "../../../common/dependency/service.ts";
import { MyPlayer, provideMyPlayer } from "../../../actions/player-move/MyPlayer.ts";
import { provideViewport, Viewport } from "../graphic/Viewport.ts";
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

export function provideFollowingMePlayerCamera(resolver: ServiceResolver) {
  return new FollowingMePlayerCamera(
    resolver.resolve(provideViewport),
    resolver.resolve(provideMyPlayer),
  );
}
