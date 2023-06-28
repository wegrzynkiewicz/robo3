import { coords2ImageRect, index2coords } from "../../../core/numbers.ts";
import { Sprite, SpriteAtlas } from "../../../core/sprite/foundation.ts";
import { SPRITES_TEXTURE_SIZE } from "../../../core/vars.ts";
import { createContext2D, loadImage } from "../helpers/image-processing.ts";

export async function allocateSpritesInCanvas(
  { sprites }: {
    sprites: Sprite[];
  }
): Promise<{ contexts: CanvasRenderingContext2D[]; }> {
  const atlases = [...new Set(sprites.map(s => s.atlas))];
  const sourceContexts = new WeakMap<SpriteAtlas, CanvasRenderingContext2D>();
  const promises = atlases.map(async (atlas) => {
    const { height, source, width } = atlas.image;
    const image = await loadImage({ height, source, width });
    const context = createContext2D(width, height);
    context.drawImage(image, 0, 0);
    sourceContexts.set(atlas, context);
  });
  await Promise.all(promises);
  const targetContexts: CanvasRenderingContext2D[] = [];
  let currentTargetContext!: CanvasRenderingContext2D;
  let currentZ = -1
  for (let spriteIndex = 0; spriteIndex < sprites.length; spriteIndex++) {
    const sprite = sprites[spriteIndex];
    const { atlas, sourceRect: src } = sprite;
    const canvas = sourceContexts.get(atlas)!;
    const sourceImage = canvas.getImageData(src.x, src.y, src.w, src.h);
    const [x, y, z] = index2coords(spriteIndex);
    if (z !== currentZ) {
      currentZ = z;
      currentTargetContext = createContext2D(SPRITES_TEXTURE_SIZE, SPRITES_TEXTURE_SIZE);
      targetContexts.push(currentTargetContext);
    }
    const [s, t] = coords2ImageRect(x, y);
    currentTargetContext!.putImageData(sourceImage, s, t);
  }
  return {
    contexts: targetContexts,
  }
}
