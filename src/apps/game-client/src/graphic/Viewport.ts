import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { SPRITES_TEXTURE_SIZE } from "../../../../core/vars.ts";
import { cornerRect } from "../../../../common/math/CornerRectangle.ts";
import { point } from "../../../../common/math/Point.ts";
import { fromTranslation, identity, ortho } from "../../../../common/math/mat4.ts";
import { providePrimaryUBO } from "./PrimaryUBO.ts";

export class Viewport {
  public readonly centerPoint = point(0, 0);
  public readonly centerChunk = point(0, 0);
  public readonly halfSize = point(0, 0);
  public readonly size = point(0, 0);
  public level = 0;
  public spaceId = 1;
  public readonly spaceRect = cornerRect(0, 0, 0, 0);
  public readonly chunkRect = cornerRect(0, 0, 0, 0);
  public readonly tilesRect = cornerRect(0, 0, 0, 0);

  public constructor(
    public readonly projectionMatrix: Float32Array,
    public readonly viewMatrix: Float32Array,
  ) {
    identity(viewMatrix);
    identity(projectionMatrix);
    this.lookAt(0, 0);
  }

  public lookAt(x: number, y: number): void {
    const { centerPoint, centerChunk, chunkRect, halfSize, spaceRect, tilesRect, viewMatrix } = this;

    centerPoint.x = x;
    centerPoint.y = y;
    centerChunk.x = Math.floor(x / SPRITES_TEXTURE_SIZE);
    centerChunk.y = Math.floor(y / SPRITES_TEXTURE_SIZE);

    spaceRect.x1 = x - halfSize.x;
    spaceRect.y1 = y - halfSize.y;
    spaceRect.x2 = x + halfSize.x;
    spaceRect.y2 = y + halfSize.y;

    tilesRect.x1 = Math.floor(spaceRect.x1 / 32);
    tilesRect.y1 = Math.floor(spaceRect.y1 / 32);
    tilesRect.x2 = Math.floor(spaceRect.x2 / 32);
    tilesRect.y2 = Math.floor(spaceRect.y2 / 32);

    chunkRect.x1 = Math.floor(spaceRect.x1 / 1024);
    chunkRect.y1 = Math.floor(spaceRect.y1 / 1024);
    chunkRect.x2 = Math.floor(spaceRect.x2 / 1024);
    chunkRect.y2 = Math.floor(spaceRect.y2 / 1024);

    const mx = -x + halfSize.x;
    const my = +y + halfSize.y;
    const mz = 0;

    fromTranslation(viewMatrix, mx, my, mz);
  }

  public setWorldSize(x: number, y: number): void {
    const { centerPoint, halfSize, projectionMatrix, size } = this;
    size.x = x;
    size.y = y;
    halfSize.x = x / 2;
    halfSize.y = y / 2;
    this.lookAt(centerPoint.x, centerPoint.y);
    ortho(projectionMatrix, 0, x, 0, y, 0, 1);
  }
}

export function provideViewport(resolver: ServiceResolver) {
  const primaryUBO = resolver.resolve(providePrimaryUBO);
  const { projectionMatrix, viewMatrix } = primaryUBO;
  return new Viewport(projectionMatrix, viewMatrix);
}
