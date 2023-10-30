import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { SCREEN_MAX_VISIBLE_TILE_X, SCREEN_MAX_VISIBLE_TILE_Y } from "../../../../core/vars.ts";
import { cornerRect } from "../../../../math/CornerRectangle.ts";
import { point } from "../../../../math/Point.ts";
import { Viewport, viewportService } from "../Viewport.ts";

const { floor, max } = Math;

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
  public readonly printable = new SceneGridVariant(0, 0);
}

export class SceneViewport {

  public readonly grid = new SceneGrid();
  public readonly tilesRect = cornerRect(0, 0, 0, 0);
  public readonly chunkRect = cornerRect(0, 0, 0, 0);

  public constructor(
    public readonly viewport: Viewport,
  ) { }

  public loop() {
    const { chunkRect, grid: { printable }, tilesRect, viewport } = this;
    tilesRect.x1 = viewport.tilesRect.x1 - 1;
    tilesRect.y1 = viewport.tilesRect.y1 - 1;
    tilesRect.x2 = viewport.tilesRect.x2 + 2;
    tilesRect.y2 = viewport.tilesRect.y2 + 2;

    chunkRect.x1 = floor(tilesRect.x1 / 32);
    chunkRect.y1 = floor(tilesRect.y1 / 32);
    chunkRect.x2 = floor(tilesRect.x2 / 32);
    chunkRect.y2 = floor(tilesRect.y2 / 32);

    printable.update(
      max(tilesRect.x2, 0) - max(tilesRect.x1, 0),
      max(tilesRect.y2, 0) - max(tilesRect.y1, 0),
    )
  }

  public get level(): number {
    return this.viewport.level;
  }

  public get spaceId(): number {
    return this.viewport.spaceId;
  }
}

export const sceneViewportService = registerService({
  async provider(resolver: ServiceResolver): Promise<SceneViewport> {
    return new SceneViewport(
      await resolver.resolve(viewportService),
    );
  },
});
