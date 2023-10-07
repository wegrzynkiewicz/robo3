import { UnifiedCanvasContext } from "../../canvas/UnifiedCanvasContext.ts";
import { dimRect } from "../../math/DimensionalRectangle.ts";
import { registerService } from "../dependency/service.ts";
import { SpriteAtlasImage } from "./atlas.ts";
import { SpriteImage, SpriteOrigin, SpriteSource } from "./sprite.ts";

export class SpriteImageExtractor {
  public *extract(atlas: SpriteAtlasImage): Generator<SpriteImage, void, unknown> {
    const {
      image,
      image: { width, height },
      source: atlasSource,
      source: { allocation, layout, spriteAtlasId },
    } = atlas;
    const origin: SpriteOrigin = { atlas: atlasSource, type: "atlas" };
    const context = new UnifiedCanvasContext(width, height);
    context.putImageData(image, 0, 0);
    switch (layout.type) {
      case "numbers": {
        const { h, w } = layout.spriteDim
        const tilesPerWidth = Math.floor(width / w);
        const tilesPerHeight = Math.floor(height / h);
        let number = 0;
        for (let y = 0; y < tilesPerHeight; y++) {
          for (let x = 0; x < tilesPerWidth; x++) {
            const sourceRect = dimRect(x * w, y * h, w, h);
            const image = context.getImageData(x * w, y * h, w, h);
            const spriteId = `${spriteAtlasId}_${number.toString().padStart(5, '0')}`;
            const source: SpriteSource = { allocation, origin, sourceRect, spriteId };
            const sprite: SpriteImage = { image, source };
            number++;
            yield sprite;
          }
        }
        break;
      }
      case "list": {
        for (const spriteInLayout of layout.sprites) {
          const { spriteId, sourceRect } = spriteInLayout;
          const source: SpriteSource = { allocation, origin, sourceRect, spriteId };
          const { x, y, w, h } = sourceRect;
          const image = context.getImageData(x, y, w, h);
          const sprite: SpriteImage = { image, source };
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
        const sprite: SpriteImage = { image, source };
        yield sprite;
        break;
      }
      case "terrain": {
        throw new Error("not-implemented");
      }
      default: {
        throw new Error("unexpected");
      }
    }
    context.dispose();
  }
}

export const SpriteImageExtractorService = registerService({
  async provider() {
    return new SpriteImageExtractor();
  },
});
