import { ServiceResolver } from "../../../common/dependency/service.ts";
import { Viewport, provideViewport } from "../graphic/viewport.ts";
import { Camera } from "./camera-manager.ts";

export class FreeCamera implements Camera {
  public constructor(
    public readonly viewport: Viewport,
  ) {}

  public loop(): void {
    // nothing
  }

  public update(x: number, y: number) {
    this.viewport.lookAt(x, y);
  }
}

export function provideFreeCamera(resolver: ServiceResolver) {
  return new FreeCamera(
    resolver.resolve(provideViewport),
  );
}
