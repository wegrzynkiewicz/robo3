import { registerService } from "../../../core/dependency/service.ts";
import { DimensionalRectangle } from "../../../math/DimensionalRectangle.ts";

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

export const spriteAllocManagerService = registerService({
  async provider(): Promise<SpriteAllocManager> {
    return new SpriteAllocManager();
  },
});
