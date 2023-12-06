import { ServiceResolver } from "../../../common/dependency/service.ts";
import { provideFreeCamera } from "./FreeCamera.ts";

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

export function provideCameraManager(resolver: ServiceResolver) {
  return new CameraManager(
    resolver.resolve(provideFreeCamera),
  );
}
