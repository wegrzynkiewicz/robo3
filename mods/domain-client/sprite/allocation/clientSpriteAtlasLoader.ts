import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { ExternalSpriteAtlasProvider } from "../../../sprite-atlas/ExternalSpriteAtlasProvider.ts";
import { SpriteAtlasLoader } from "../../../sprite-atlas/SpriteAtlasLoader.ts";
import { SpriteAtlasSource } from "../../../sprite-atlas/atlas.ts";
import { shadowSpriteAtlasProviderService } from "../shadow/ShadowSpriteAtlasProvider.ts";

export function provideSpriteAtlasLoader(resolver: ServiceResolver) {
  const loader = new SpriteAtlasLoader();
  const build: SpriteAtlasSource = {
    allocation: {
      type: "static",
    },
    layout: {
      spriteDim: { h: 32, w: 32 },
      type: "numbers",
    },
    origin: {
      type: "external",
      url: `${window.location.origin}/assets/3.png`, // TODO: hardcode
    },
    spriteAtlasId: "build-in",
  };
  loader.addProvider(new ExternalSpriteAtlasProvider(build));
  loader.addProvider(resolver.resolve(provideShadowSpriteAtlasProvider));

  const mage: SpriteAtlasSource = {
    allocation: {
      type: "static",
    },
    layout: {
      spriteDim: { h: 32, w: 32 },
      type: "numbers",
    },
    origin: {
      type: "external",
      url: `${window.location.origin}/assets/mage-cyan.png`, // TODO: hardcode
    },
    spriteAtlasId: "mage",
  };
  loader.addProvider(new ExternalSpriteAtlasProvider(mage));

  return loader;
}
