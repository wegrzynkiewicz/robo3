import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { cornerRect } from "../../../math/CornerRectangle.ts";
import { point } from "../../../math/Point.ts";
import { identity, ortho, fromTranslation } from "../../../math/mat4.ts";
import { primaryUBOService } from "./PrimaryUBO.ts";

export class Viewport {
  public readonly centerPoint = point(0, 0);
  public readonly worldHalfSize = point(0, 0);
  public readonly worldSize = point(0, 0);
  public readonly worldSpaceRect = cornerRect(0, 0, 0, 0);
  public constructor(
    public readonly projectionMatrix: Float32Array,
    public readonly viewMatrix: Float32Array,
  ) {
    identity(viewMatrix);
    identity(projectionMatrix);
    this.lookAt(0, 0);
  }

  public setWorldSize(x: number, y: number): void {
    const { projectionMatrix, worldHalfSize, worldSize } = this;
    worldSize.x = x;
    worldSize.y = y;
    worldHalfSize.x = x / 2;
    worldHalfSize.y = y / 2;
    ortho(projectionMatrix, 0, x, 0, y, 0, 1);
  }

  public lookAt(x: number, y: number): void {
    const { centerPoint, viewMatrix, worldHalfSize, worldSpaceRect } = this;

    centerPoint.x = x;
    centerPoint.y = y;
    worldSpaceRect.x1 = x - worldHalfSize.x;
    worldSpaceRect.y1 = y - worldHalfSize.y;
    worldSpaceRect.x2 = x + worldHalfSize.x;
    worldSpaceRect.y2 = y + worldHalfSize.y;

    const mx = -x + worldHalfSize.x;
    const my = y + worldHalfSize.y;
    const mz = 0;

    fromTranslation(viewMatrix, mx, my, mz);
  }
}

export const viewportService = registerService({
  async provider(resolver: ServiceResolver) {
    const primaryUBO = await resolver.resolve(primaryUBOService);
    const { projectionMatrix, viewMatrix } = primaryUBO
    return new Viewport(projectionMatrix, viewMatrix);
  },
});
