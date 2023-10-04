import { createUnifiedCanvasContext } from "../../canvas/UnifiedCanvasContext.ts";
import { dimRect } from "../../math/DimensionalRectangle.ts";
import { registerService } from "../dependency/service.ts";
import { SpriteAtlasImageData } from "./atlas.ts";
import { SpriteImageData, SpriteOrigin, SpriteSource } from "./sprite.ts";

export class SpriteImageDataExtractor {
  public *extract(atlas: SpriteAtlasImageData): Generator<SpriteImageData, void, unknown> {
    const {
      image,
      image: { width, height },
      source: atlasSource,
      source: { allocation, layout, spriteAtlasId },
    } = atlas;
    const origin: SpriteOrigin = { atlas: atlasSource, type: 'atlas' };
    const context = createUnifiedCanvasContext(width, height);
    context.putImageData(image, 0, 0);
    switch (layout.type) {
      case "list": {
        for (const spriteInLayout of layout.sprites) {
          const { spriteId, sourceRect } = spriteInLayout;
          const source: SpriteSource = { allocation, origin, sourceRect, spriteId };
          const { x, y, w, h } = sourceRect;
          const image = context.getImageData(x, y, w, h);
          const sprite: SpriteImageData = { image, source };
          yield sprite;
        }
        break;
      }
      case "single": {
        const sourceRect = dimRect(0, 0, width, height);
        const spriteId = spriteAtlasId;
        const source: SpriteSource = { allocation, origin, sourceRect, spriteId };
        const { x, y, w, h } = sourceRect;
        const image = context.getImageData(x, y, w, h);
        const sprite: SpriteImageData = { image, source };
        yield sprite;
        break;
      }
      case "terrain": {
        throw new Error('not-implemented');
      }
      default: {
        throw new Error('unexpected');
      }
    }
    context.dispose();
  }
}

export const spriteImageDataExtractorService = registerService({
  async provider() {
    return new SpriteImageDataExtractor();
  },
});