import { registerService,ServiceResolver } from "../../../core/dependency/service.ts";
import { freeCameraService } from "./FreeCamera.ts";

export interface Camera {
  update(): void;
}

export class CameraManager {
  public constructor(
    protected currentCamera: Camera,
  ) {
  }

  public setCurrentCamera(camera: Camera) {
    this.currentCamera = camera;
  }

  public update(): void {
    this.currentCamera.update();
  }
}

export const cameraManagerService = registerService({
  async provider(resolver: ServiceResolver): Promise<CameraManager> {
    const [freeCamera] = await Promise.all([
      resolver.resolve(freeCameraService),
    ]);
    return new CameraManager(freeCamera);
  },
});

