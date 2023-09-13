import { SPRITE_SIZE, SPRITES_PER_TEXTURE_AXIS } from "./vars.ts";

export interface Dimension {
  d: number;
  h: number;
  w: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Cube {
  b: number;
  f: number;
  l: number;
  n: number;
  r: number;
  t: number;
}

export function createIndexCalculator(width: number, height: number): (x: number, y: number, z: number) => number {
  const area = width * height;
  return function (x: number, y: number, z: number): number {
    return (z * area) + (y * width) + x;
  };
}

export function createCoordinatesCalculator(
  width: number,
  height: number,
): (index: number) => [number, number, number] {
  const area = width * height;
  return function (index: number): [number, number, number] {
    const z = Math.floor(index / area);
    const rest = index % area;
    const y = Math.floor(rest / width);
    const x = rest % width;
    return [x, y, z];
  };
}

export const coords2index = createIndexCalculator(SPRITES_PER_TEXTURE_AXIS, SPRITES_PER_TEXTURE_AXIS);
export const index2coords = createCoordinatesCalculator(SPRITES_PER_TEXTURE_AXIS, SPRITES_PER_TEXTURE_AXIS);

export function coords2ImageRect(x: number, y: number): [number, number] {
  const s = x * SPRITE_SIZE;
  const t = (SPRITES_PER_TEXTURE_AXIS - y - 1) * SPRITE_SIZE;
  return [s, t];
}
