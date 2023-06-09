export const TILES_TEXTURE_SIZE = 1024;
export const TILE_SIZE = 32;
export const TILES_PER_TEXTURE_AXIS = Math.floor(TILES_TEXTURE_SIZE / TILE_SIZE);
export const TILES_PER_TEXTURE = TILES_PER_TEXTURE_AXIS ** 2;
export const TILE_STRIDE_NORMALIZED = TILE_SIZE / TILES_TEXTURE_SIZE;

export const MAX_WORLD_TILES_PER_AXIS = 65536;
export const MAX_WORLD_DEPTH = 256;

export const TILES_PER_CHUNK_AXIS = 16;
export const TILES_PER_CHUNK = TILES_PER_CHUNK_AXIS ** 2;

// X,Y,Z,0 - 4
// R,T,U   - 4
// 0,1,2,3 - 4

// u16 - pos
// u16 - tex
// u16 - alfa
