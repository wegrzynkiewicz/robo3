import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { ExternalSpriteAtlasProvider } from "../../../core/sprite/ExternalSpriteAtlasProvider.ts";
import { SpriteAtlasLoader } from "../../../core/sprite/SpriteAtlasLoader.ts";
import { SpriteAtlasSource } from "../../../core/sprite/atlas.ts";
import { shadowSpriteAtlasProviderService } from "../shadow/ShadowSpriteAtlasProvider.ts";

export const clientSpriteAtlasLoaderService = registerService({
  async provider(resolver: ServiceResolver): Promise<SpriteAtlasLoader> {
    const loader = new SpriteAtlasLoader();
    const build: SpriteAtlasSource = {
      allocation: {
        type: 'static',
      },
      layout: {
        spriteDim: { h: 32, w: 32 },
        type: "numbers",
      },
      origin: {
        type: "external",
        url: `${window.location.origin}/assets/tileset.png`, // TODO: hardcode
      },
      spriteAtlasId: 'build-in',
    }
    // loader.addProvider(new ExternalSpriteAtlasProvider(build));
    loader.addProvider(await resolver.resolve(shadowSpriteAtlasProviderService));
    return loader;
  },
});
