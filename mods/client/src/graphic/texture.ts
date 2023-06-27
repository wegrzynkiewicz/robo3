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

  function insert(index: number, image: ImageData) {
    const [x, y, z] = index2coords(index);
    if (z !== currentZ) {
      currentZ = z;
      currentTargetContext = createContext2D(SPRITES_TEXTURE_SIZE, SPRITES_TEXTURE_SIZE);
      contexts.push(currentTargetContext);
    }
    const [s, t] = coords2ImageRect(x, y);
    currentTargetContext!.putImageData(image, s, t);
  }

  for (const sprite of sprites) {
    const { predefinedSpriteIndex } = sprite.definition;
    if (predefinedSpriteIndex !== undefined) {
      targets[predefinedSpriteIndex] = sprite;
    }
  }
  let spriteIndex = 0;
  for (const sprite of sprites) {
    const { predefinedSpriteIndex } = sprite.definition;
    if (predefinedSpriteIndex === undefined) {
      while (targets[spriteIndex] !== undefined) {
        spriteIndex++;
      }
      targets[spriteIndex] = sprite;
    }
  }
  for (let index = 0; index < targets.length; index++) {
    const sprite = targets[index];
    insert(index, sprite.image);
    sprite.spriteIndex = index;
  }
  return { contexts, targets };
}
