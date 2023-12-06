import { ServiceResolver } from "../../../common/dependency/service.ts";
import { ExternalSpriteAtlasProvider } from "../../../common/sprite-atlas/ExternalSpriteAtlasProvider.ts";
import { SpriteAtlasLoader } from "../../../common/sprite-atlas/SpriteAtlasLoader.ts";
import { SpriteAtlasSource } from "../../../common/sprite-atlas/atlas.ts";
import { provideShadowSpriteAtlasProvider } from "../shadow/ShadowSpriteAtlasProvider.ts";

export function provideClientSpriteAtlasLoader(resolver: ServiceResolver) {
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
