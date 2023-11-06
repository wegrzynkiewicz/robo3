import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { SpriteAtlasImage, SpriteAtlasProvider, SpriteAtlasSource } from "../../../sprite-atlas/atlas.ts";
import { dim2D } from "../../../math/Dim2D.ts";
import { ShadowSpriteAtlasGenerator, shadowSpriteAtlasGeneratorService } from "./ShadowSpriteAtlasGenerator.ts";

export class ShadowSpriteAtlasProvider implements SpriteAtlasProvider {
  public constructor(
    public readonly shadowSpriteAtlasGenerator: ShadowSpriteAtlasGenerator,
  ) {}

  async provideSpriteAtlasImage(): Promise<SpriteAtlasImage> {
    const source: SpriteAtlasSource = {
      allocation: {
        type: "static",
      },
      layout: {
        spriteDim: dim2D(32, 32),
        type: "terrain",
      },
      origin: {
        type: "generated",
        description: `shadow-generator-${this.shadowSpriteAtlasGenerator.intensive}`,
      },
      spriteAtlasId: "shadow",
    };
    const image = this.shadowSpriteAtlasGenerator.generate();
    const data: SpriteAtlasImage = { image, source };
    return data;
  }
}

export const shadowSpriteAtlasProviderService = registerService({
  async provider(resolver: ServiceResolver): Promise<ShadowSpriteAtlasProvider> {
    return new ShadowSpriteAtlasProvider(
      await resolver.resolve(shadowSpriteAtlasGeneratorService),
    );
  },
});
