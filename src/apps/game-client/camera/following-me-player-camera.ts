import { ServiceResolver } from "../../../common/dependency/service.ts";
import { MyPlayer, provideMyPlayer } from "../../../actions/player-move/my-player.ts";
import { provideViewport, Viewport } from "../graphic/viewport.ts";
import { Camera } from "./camera-manager.ts";

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
