import { Dim2D } from "../../math/Dim2D.ts";
import { DimensionalRectangle } from "../../math/DimensionalRectangle.ts";
import { SpriteAllocation } from "./sprite.ts";

export interface ExternalSpriteAtlasOrigin {
  type: "external";
  url: string;
}

export interface GeneratedSpriteAtlasOrigin {
  type: "generated";
  description: string;
}

export type SpriteAtlasOrigin = ExternalSpriteAtlasOrigin | GeneratedSpriteAtlasOrigin;

export interface SpriteInListSpriteAtlasLayout {
  spriteId: string;
  sourceRect: DimensionalRectangle;
}


export interface GridNumbersSpriteAtlasLayout {
  spriteDim: Dim2D;
  type: "numbers";
}

export interface GridNamesSpriteAtlasLayout {
  spriteDim: Dim2D;
  type: "names";
  names: string[];
}

export interface ListSpriteAtlasLayout {
  type: "list";
  sprites: SpriteInListSpriteAtlasLayout[];
}

export interface SingleSpriteAtlasLayout {
  type: "single";
}

export interface TerrainSpriteAtlasLayout {
  type: "terrain";
}

export type SpriteAtlasLayout =
  | GridNamesSpriteAtlasLayout
  | GridNumbersSpriteAtlasLayout
  | ListSpriteAtlasLayout
  | SingleSpriteAtlasLayout
  | TerrainSpriteAtlasLayout;

export interface SpriteAtlasSource {
  allocation: SpriteAllocation;
  layout: SpriteAtlasLayout;
  origin: SpriteAtlasOrigin;
  spriteAtlasId: string;
}

export interface SpriteAtlasImage {
  image: ImageData;
  source: SpriteAtlasSource;
}

export interface SpriteAtlasProvider {
  provideSpriteAtlasImage(): Promise<SpriteAtlasImage>;
}
