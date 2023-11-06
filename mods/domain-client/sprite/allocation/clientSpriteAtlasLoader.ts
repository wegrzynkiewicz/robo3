import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { ExternalSpriteAtlasProvider } from "../../../sprite-atlas/ExternalSpriteAtlasProvider.ts";
import { SpriteAtlasLoader } from "../../../sprite-atlas/SpriteAtlasLoader.ts";
import { SpriteAtlasSource } from "../../../sprite-atlas/atlas.ts";
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
