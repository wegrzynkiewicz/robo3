import { DimensionalRectangle } from "../../math/DimensionalRectangle.ts";

export interface SpriteInListSpriteAtlasLayout {
  spriteId: string,
  sourceRect: DimensionalRectangle;
}

export interface ListSpriteAtlasLayout {
  type: 'list',
  sprites: SpriteInListSpriteAtlasLayout[],
}

export interface SingleSpriteAtlasLayout {
  type: 'single',
}

export interface TerrainSpriteAtlasLayout {
  type: 'terrain',
}

export interface StaticSpriteAtlasAllocation {
  type: 'static',
}

export type SpriteAtlasAllocation = StaticSpriteAtlasAllocation;

export type SpriteAtlasLayout = ListSpriteAtlasLayout | SingleSpriteAtlasLayout | TerrainSpriteAtlasLayout;

export interface SpriteAtlasSource {
  allocation: SpriteAtlasAllocation;
  layout: SpriteAtlasLayout;
  spriteAtlasId: string;
  url: string;
}

export interface SpriteAtlasImageData {
  image: ImageData;
  source: SpriteAtlasSource;
}

export interface SpriteAtlasProvider {
  provideSpriteAtlasImages(): Promise<SpriteAtlasImageData[]>;
}

export interface SpriteSource {
  atlasSource: SpriteAtlasSource
  spriteId: string;
  sourceRect: DimensionalRectangle;
}

export interface SpriteImageData {
  image: ImageData;
  source: SpriteSource;
}
