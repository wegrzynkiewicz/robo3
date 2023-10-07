import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { SpriteAtlasImage, SpriteAtlasProvider, SpriteAtlasSource } from "../../../core/sprite/atlas.ts";
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
