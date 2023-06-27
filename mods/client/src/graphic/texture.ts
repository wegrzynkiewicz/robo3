import { coords2ImageRect, index2coords } from "../../../core/numbers.ts";
import { SPRITES_TEXTURE_SIZE } from "../../../core/vars.ts";
import { createContext2D } from "../helpers/image-processing.ts";
import { Sprite } from "../sprite/foundation.ts";

export function allocateSpritesInCanvas(
  { sprites }: {
    sprites: Sprite[];
  }
) {
  const targets: Sprite[] = [];
  const contexts: CanvasRenderingContext2D[] = [];
  let currentTargetContext!: CanvasRenderingContext2D;
  let currentZ = -1;
  let spriteIndex = 0;

  function insert(image: ImageData) {
    const [x, y, z] = index2coords(spriteIndex);
    if (z !== currentZ) {
      currentZ = z;
      currentTargetContext = createContext2D(SPRITES_TEXTURE_SIZE, SPRITES_TEXTURE_SIZE);
      contexts.push(currentTargetContext);
    }
    const [s, t] = coords2ImageRect(x, y);
    currentTargetContext!.putImageData(image, s, t);
  }

  for (const sprite of sprites) {
    const { spriteIndex } = sprite;
    if (spriteIndex !== -1) {
      targets[spriteIndex] = sprite;
    }
  }

  for (const sprite of sprites) {
    if (targets[spriteIndex] === undefined) {
      insert(sprite.image);
      sprite.spriteIndex = spriteIndex;
      targets[spriteIndex] = sprite;
    } else {
      insert(targets[spriteIndex].image);
    }
    spriteIndex++;
  }

  return {contexts, targets};
}
