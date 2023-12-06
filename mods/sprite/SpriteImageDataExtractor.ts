import { createUnifiedCanvas, UnifiedCanvasContext } from "../canvas/mod.ts";
import { dimRect } from "../common/math/DimensionalRectangle.ts";
import { SpriteAtlasImage } from "../sprite-atlas/atlas.ts";
import { SpriteImage, SpriteOrigin, SpriteSource } from "./sprite.ts";

const terrains = [
  "LSE",
  "UN",
  "LSW",
  "CSE",
  "ES",
  "CSW",
  "UW",
  "EMP",
  "UE",
  "EE",
  "FILL",
  "EW",
  "LNE",
  "US",
  "LNW",
  "CNE",
  "EN",
  "CNW",
];

export class SpriteImageExtractor {
  public readonly context: UnifiedCanvasContext;
  public constructor(
    public readonly atlas: SpriteAtlasImage,
  ) {
    const { image, image: { width, height } } = atlas;
    this.context = createUnifiedCanvas(width, height);
    this.context.putImageData(image, 0, 0);
  }

  protected *extractMany(callback: (number: number) => string) {
    const { width, height } = this.atlas.image;
    const { h, w } = (this.atlas.source.layout as any).spriteDim;
    const tilesPerWidth = Math.floor(width / w);
    const tilesPerHeight = Math.floor(height / h);
    let i = 0;
    for (let y = 0; y < tilesPerHeight; y++) {
      for (let x = 0; x < tilesPerWidth; x++) {
        const sourceRect = dimRect(x * w, y * h, w, h);
        const spriteId = callback(i++);
        yield { sourceRect, spriteId };
      }
    }
  }

  protected *extractElementals() {
    const { image: { width, height }, source: { layout, spriteAtlasId } } = this.atlas;
    switch (layout.type) {
      case "names": {
        yield* this.extractMany((n) => `${spriteAtlasId}/${layout.names[n]}`);
        break;
      }
      case "numbers": {
        yield* this.extractMany((n) => `${spriteAtlasId}/${n.toString().padStart(5, "0")}`);
        break;
      }
      case "list": {
        for (const spriteInLayout of layout.sprites) {
          yield spriteInLayout;
        }
        break;
      }
      case "single": {
        yield {
          sourceRect: dimRect(0, 0, width, height),
          spriteId: spriteAtlasId,
        };
        break;
      }
      case "terrain": {
        yield* this.extractMany((n) => `${spriteAtlasId}/${terrains[n]}`);
        break;
      }
      default: {
        throw new Error("unexpected");
      }
    }
  }

  public *extract(atlas: SpriteAtlasImage): Generator<SpriteImage, void, unknown> {
    const { source: atlasSource, source: { allocation } } = atlas;
    const origin: SpriteOrigin = { atlas: atlasSource, type: "atlas" };
    for (const { sourceRect, spriteId } of this.extractElementals()) {
      const source: SpriteSource = { allocation, origin, sourceRect, spriteId };
      const { x, y, w, h } = sourceRect;
      const image = this.context.getImageData(x, y, w, h);
      const sprite: SpriteImage = { image, source };
      yield sprite;
    }
  }
}
