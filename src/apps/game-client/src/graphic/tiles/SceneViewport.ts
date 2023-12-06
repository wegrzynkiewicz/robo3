import { ServiceResolver } from "../../../../../common/dependency/service.ts";
import { SCREEN_MAX_VISIBLE_TILE_X, SCREEN_MAX_VISIBLE_TILE_Y } from "../../../../../core/vars.ts";
import { cornerRect } from "../../../../../common/math/CornerRectangle.ts";
import { point } from "../../../../../common/math/Point.ts";
import { Viewport, provideViewport } from "../Viewport.ts";
import { PrimaryUBO, providePrimaryUBO } from "../PrimaryUBO.ts";

class SceneGridVariant {
  public cellCount = 0;
  public readonly size = point(0, 0);

  public constructor(x: number, y: number) {
    this.update(x, y);
  }

  public update(x: number, y: number) {
    this.size.x = x;
    this.size.y = y;
    this.cellCount = y * x;
  }
}

class SceneGrid {
  public readonly available = new SceneGridVariant(
    SCREEN_MAX_VISIBLE_TILE_X + 3,
    SCREEN_MAX_VISIBLE_TILE_Y + 3,
  );
}

export class SceneViewport {
  public readonly grid = new SceneGrid();
  public readonly absoluteRect = cornerRect(0, 0, 0, 0);
  public readonly tilesRect = cornerRect(0, 0, 0, 0);
  public readonly chunkRect = cornerRect(0, 0, 0, 0);

  public constructor(
    public readonly viewport: Viewport,
    public readonly primaryUBO: PrimaryUBO,
  ) {}

  public loop() {
    const { absoluteRect, chunkRect, primaryUBO, tilesRect, viewport } = this;
    tilesRect.x1 = viewport.tilesRect.x1 - 1;
    tilesRect.y1 = viewport.tilesRect.y1 - 1;
    tilesRect.x2 = viewport.tilesRect.x2 + 2;
    tilesRect.y2 = viewport.tilesRect.y2 + 2;

    absoluteRect.x1 = tilesRect.x1 * 32;
    absoluteRect.y1 = tilesRect.y1 * 32;
    absoluteRect.x2 = tilesRect.x2 * 32;
    absoluteRect.y2 = tilesRect.y2 * 32;

    chunkRect.x1 = Math.floor(tilesRect.x1 / 32);
    chunkRect.y1 = Math.floor(tilesRect.y1 / 32);
    chunkRect.x2 = Math.floor(tilesRect.x2 / 32);
    chunkRect.y2 = Math.floor(tilesRect.y2 / 32);

    primaryUBO.pixelOffset[0] = absoluteRect.x1;
    primaryUBO.pixelOffset[1] = absoluteRect.y1;
    primaryUBO.pixelOffset[2] = absoluteRect.x2;
    primaryUBO.pixelOffset[3] = absoluteRect.y2;
  }

  public get level(): number {
    return this.viewport.level;
  }

  public get spaceId(): number {
    return this.viewport.spaceId;
  }
}

export function provideSceneViewport(resolver: ServiceResolver) {
  return new SceneViewport(
    resolver.resolve(provideViewport),
    resolver.resolve(providePrimaryUBO),
  );
}
