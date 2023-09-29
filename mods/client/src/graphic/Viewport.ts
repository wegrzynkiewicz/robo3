import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { SPRITES_TEXTURE_SIZE } from "../../../core/vars.ts";
import { cornerRect } from "../../../math/CornerRectangle.ts";
import { point } from "../../../math/Point.ts";
import { fromTranslation, identity, ortho } from "../../../math/mat4.ts";
import { primaryUBOService } from "./PrimaryUBO.ts";

export class Viewport {
  public readonly centerPoint = point(0, 0);
  public readonly centerChunk = point(0, 0);
  public depth = 0;
  public readonly halfSize = point(0, 0);
  public readonly size = point(0, 0);
  public readonly spaceRect = cornerRect(0, 0, 0, 0);
  public spaceId = 0;

  public constructor(
    public readonly projectionMatrix: Float32Array,
    public readonly viewMatrix: Float32Array,
  ) {
    identity(viewMatrix);
    identity(projectionMatrix);
    this.lookAt(0, 0);
  }

  public lookAt(x: number, y: number): void {
    const { centerPoint, centerChunk, halfSize, spaceRect, viewMatrix } = this;

    centerPoint.x = x;
    centerPoint.y = y;
    centerChunk.x = Math.floor(x / SPRITES_TEXTURE_SIZE);
    centerChunk.y = Math.floor(y / SPRITES_TEXTURE_SIZE);
    spaceRect.x1 = x - halfSize.x;
    spaceRect.y1 = y - halfSize.y;
    spaceRect.x2 = x + halfSize.x;
    spaceRect.y2 = y + halfSize.y;

    const mx = -x + halfSize.x;
    const my = +y + halfSize.y;
    const mz = 0;

    fromTranslation(viewMatrix, mx, my, mz);
  }

  public setDepth(depth: number): void {
    this.depth = depth;
  }

  public setSpaceId(spaceId: number): void {
    this.spaceId = spaceId;
  }

  public setWorldSize(x: number, y: number): void {
    const { halfSize, projectionMatrix, size } = this;
    size.x = x;
    size.y = y;
    halfSize.x = x / 2;
    halfSize.y = y / 2;
    ortho(projectionMatrix, 0, x, 0, y, 0, 1);
  }
}

export const viewportService = registerService({
  async provider(resolver: ServiceResolver) {
    const primaryUBO = await resolver.resolve(primaryUBOService);
    const { projectionMatrix, viewMatrix } = primaryUBO;
    return new Viewport(projectionMatrix, viewMatrix);
  },
});
