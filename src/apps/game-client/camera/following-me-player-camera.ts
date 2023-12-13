import { MePlayer, provideMePlayer } from "../../../actions/me/me-player.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { provideViewport, Viewport } from "../graphic/viewport.ts";
import { Camera } from "./camera-manager.ts";

export class FollowingMePlayerCamera implements Camera {
  public constructor(
    public readonly viewport: Viewport,
    public readonly myPlayer: MePlayer,
  ) {}

  public loop(): void {
    const { x, y } = this.myPlayer.absolutePos;
    this.viewport.lookAt(x, y);
  }
}

export function provideFollowingMePlayerCamera(resolver: ServiceResolver) {
  return new FollowingMePlayerCamera(
    resolver.resolve(provideViewport),
    resolver.resolve(provideMePlayer),
  );
}
