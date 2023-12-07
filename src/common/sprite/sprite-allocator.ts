import { UnifiedCanvasContext } from "../canvas/common.ts";
import { createUnifiedCanvas } from "../canvas/mod.ts";
import { index2coords } from "../../core/numbers.ts";
import { Dim2D, dim2D } from "../math/dim2d.ts";
import { Pos2D, pos2D } from "../math/pos2d.ts";
import { SpriteImage } from "./sprite.ts";

export interface SpriteBinding {
  spriteId: string;
  spriteIndex: number;
  tile: {
    size: Dim2D;
  };
  texture: {
    atlasIndex: number;
    mapping: Pos2D;
    size: Dim2D;
  };
}

export interface AllocationResult {
  canvases: UnifiedCanvasContext[];
  bindings: SpriteBinding[];
}

export class SpriteAllocator {
  public bindings: SpriteBinding[] = [];
  public canvases: UnifiedCanvasContext[] = [];
  protected spriteIndex = 0;
  protected currentZ = -1;
  protected currentTargetCanvas!: UnifiedCanvasContext;

  public constructor(
    public readonly width: number,
    public readonly height: number,
  ) {}

  public allocate(sprites: SpriteImage[]): AllocationResult {
    for (const sprite of sprites) {
      this.allocateSprite(sprite);
    }
    return this;
  }

  protected allocateSprite(sprite: SpriteImage) {
    let [x, y, z] = index2coords(this.spriteIndex);
    if (z !== this.currentZ) {
      this.currentZ = z;
      this.currentTargetCanvas = createUnifiedCanvas(this.width, this.height);
      this.canvases.push(this.currentTargetCanvas);
      [x, y] = index2coords(this.spriteIndex);
    }
    const [dstX, dstY] = [x * 32, y * 32];
    this.currentTargetCanvas!.putImageData(sprite.image, dstX, dstY);
    const spriteBinding: SpriteBinding = {
      spriteIndex: this.spriteIndex,
      spriteId: sprite.source.spriteId,
      texture: {
        atlasIndex: this.currentZ,
        mapping: pos2D(dstX, dstY),
        size: dim2D(32, 32),
      },
      tile: {
        size: dim2D(32, 32),
      },
    };
    this.bindings.push(spriteBinding);
    this.spriteIndex++;
  }
}
