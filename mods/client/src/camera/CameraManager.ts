import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { freeCameraService } from "./FreeCamera.ts";

export interface Camera {
  loop(): void;
}

export class CameraManager {
  public constructor(
    protected currentCamera: Camera,
  ) {}

  public setCurrentCamera(camera: Camera) {
    this.currentCamera = camera;
  }

  public loop(): void {
    this.currentCamera.loop();
  }
}

export const cameraManagerService = registerService({
  async provider(resolver: ServiceResolver): Promise<CameraManager> {
    return new CameraManager(
      await resolver.resolve(freeCameraService),
    );
  },
});
