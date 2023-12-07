import { ServiceResolver } from "../../../common/dependency/service.ts";
import { SpriteAtlasImage, SpriteAtlasProvider, SpriteAtlasSource } from "../../../common/sprite-atlas/atlas.ts";
import { dim2D } from "../../../common/math/dim2d.ts";
import { provideShadowSpriteAtlasGenerator, ShadowSpriteAtlasGenerator } from "./shadow-sprite-atlas-generator.ts";

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

export function provideShadowSpriteAtlasProvider(resolver: ServiceResolver) {
  return new ShadowSpriteAtlasProvider(
    resolver.resolve(provideShadowSpriteAtlasGenerator),
  );
}
