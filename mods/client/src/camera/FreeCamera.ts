import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { Viewport, viewportService } from "../graphic/Viewport.ts";
import { Camera } from "./CameraManager.ts";

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

export const freeCameraService = registerService({
  name: "freeCameraManager",
  async provider(resolver: ServiceResolver): Promise<FreeCamera> {
    return new FreeCamera(
      await resolver.resolve(viewportService),
    );
  },
});
