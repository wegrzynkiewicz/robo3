import { TILE_SIZE, TILES_PER_TEXTURE, TILES_PER_TEXTURE_AXIS } from "./vars.ts";

export function coords2index(x: number, y: number, z: number): number {
  return (z * TILES_PER_TEXTURE) + (y * TILES_PER_TEXTURE_AXIS) + x;
}

export function index2coords(index: number): [number, number, number] {
  const z = Math.floor(index / TILES_PER_TEXTURE);
  const y = Math.floor((index % TILES_PER_TEXTURE) / TILES_PER_TEXTURE_AXIS);
  const x = index % TILES_PER_TEXTURE_AXIS;
  return [x, y, z];
}

export function coords2ImageRect(x: number, y: number): [number, number] {
  const s = x * TILE_SIZE;
  const t = (TILES_PER_TEXTURE_AXIS - y - 1) * TILE_SIZE;
  return [s, t];
}
