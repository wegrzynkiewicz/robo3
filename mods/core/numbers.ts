import { TILE_SIZE, TILES_PER_TEXTURE_AXIS } from "./vars.ts";

export interface Dimension {
  depth: number;
  height: number;
  width: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
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

export const coords2index = createIndexCalculator(TILES_PER_TEXTURE_AXIS, TILES_PER_TEXTURE_AXIS);
export const index2coords = createCoordinatesCalculator(TILES_PER_TEXTURE_AXIS, TILES_PER_TEXTURE_AXIS);

export function coords2ImageRect(x: number, y: number): [number, number] {
  const s = x * TILE_SIZE;
  const t = (TILES_PER_TEXTURE_AXIS - y - 1) * TILE_SIZE;
  return [s, t];
}
