import { UnifiedCanvasContext } from "../../canvas/UnifiedCanvasContext.ts";
import { Breaker } from "../../common/asserts.ts";
import { SpriteAtlasImage, SpriteAtlasProvider, SpriteAtlasSource } from "./atlas.ts";

export class ExternalSpriteAtlasProvider implements SpriteAtlasProvider {
  public constructor(
    public readonly source: SpriteAtlasSource,
  ) {}

  async provideSpriteAtlasImage(): Promise<SpriteAtlasImage> {
    const { source, source: { origin } } = this;
    if (origin.type !== "external") {
      throw new Breaker("unexpected-sprite-atlas-source-origin-type", { source });
    }
    const url = new URL(origin.url);
    const context = await UnifiedCanvasContext.createFromImageURL(url);
    const image = context.getImageData(0, 0, context.width, context.height);
    const data: SpriteAtlasImage = { image, source };
    return data;
  }
}
