import { registerService, ServiceResolver } from "../../../../dependency/service.ts";
import { SCREEN_MAX_VISIBLE_TILE_X, SCREEN_MAX_VISIBLE_TILE_Y } from "../../../../core/vars.ts";
import { cornerRect } from "../../../../math/CornerRectangle.ts";
import { point } from "../../../../math/Point.ts";
import { Viewport, viewportService } from "../Viewport.ts";
import { PrimaryUBO, primaryUBOService } from "../PrimaryUBO.ts";

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
  public readonly tilesRect = cornerRect(0, 0, 0, 0);
  public readonly chunkRect = cornerRect(0, 0, 0, 0);

  public constructor(
    public readonly viewport: Viewport,
    public readonly primaryUBO: PrimaryUBO,
  ) {}

  public loop() {
    const { chunkRect, primaryUBO, tilesRect, viewport } = this;
    tilesRect.x1 = viewport.tilesRect.x1 - 1;
    tilesRect.y1 = viewport.tilesRect.y1 - 1;
    tilesRect.x2 = viewport.tilesRect.x2 + 2;
    tilesRect.y2 = viewport.tilesRect.y2 + 2;

    chunkRect.x1 = Math.floor(tilesRect.x1 / 32);
    chunkRect.y1 = Math.floor(tilesRect.y1 / 32);
    chunkRect.x2 = Math.floor(tilesRect.x2 / 32);
    chunkRect.y2 = Math.floor(tilesRect.y2 / 32);

    primaryUBO.pixelOffset[0] = tilesRect.x1 * 32;
    primaryUBO.pixelOffset[1] = tilesRect.y1 * 32;
    primaryUBO.pixelOffset[2] = tilesRect.x2 * 32;
    primaryUBO.pixelOffset[3] = tilesRect.y2 * 32;
  }

  public get level(): number {
    return this.viewport.level;
  }

  public get spaceId(): number {
    return this.viewport.spaceId;
  }
}

export const sceneViewportService = registerService({
  name: 'sceneViewport',
  async provider(resolver: ServiceResolver): Promise<SceneViewport> {
    return new SceneViewport(
      await resolver.resolve(viewportService),
      await resolver.resolve(primaryUBOService),
    );
  },
});
