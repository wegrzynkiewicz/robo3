import { DimensionalRectangle } from "../../../common/math/dimensional-rectangle.ts";

export interface SpriteAlloc {
  absoluteDim: DimensionalRectangle;
  gridDim: DimensionalRectangle;
  spriteId: string;
  samplerIndex: number;
  spriteIndex: number;
  texture2DArrayIndex: number;
}

export class SpriteAllocManager {
  public readonly byId = new Map<string, SpriteAlloc>();
  public readonly bySpriteIndex: SpriteAlloc[] = [];

  public set(alloc: SpriteAlloc): void {
    const { spriteId, spriteIndex } = alloc;
    this.byId.set(spriteId, alloc);
    this.bySpriteIndex[spriteIndex] = alloc;
  }
}

export function provideSpriteAllocManager() {
  return new SpriteAllocManager();
}
