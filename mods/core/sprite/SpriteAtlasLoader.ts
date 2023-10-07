import { SpriteAtlasImage, SpriteAtlasProvider } from "./atlas.ts";

export class SpriteAtlasLoader {
  public readonly providers: SpriteAtlasProvider[] = [];

  public addProvider(spriteAtlasProvider: SpriteAtlasProvider): void {
    this.providers.push(spriteAtlasProvider);
  }

  public async loadSpriteAtlasImages(): Promise<SpriteAtlasImage[]> {
    const promises = this.providers.map(async (provider) => {
      return provider.provideSpriteAtlasImage();
    });
    const images = await Promise.all(promises);
    return images;
  }
}
