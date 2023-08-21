export const SPRITES_TEXTURE_SIZE = 1024;
export const SPRITE_SIZE = 32;
export const SPRITES_PER_TEXTURE_AXIS = Math.floor(SPRITES_TEXTURE_SIZE / SPRITE_SIZE);
export const SPRITES_PER_TEXTURE = SPRITES_PER_TEXTURE_AXIS ** 2;
export const SPRITE_STRIDE_NORMALIZED = SPRITE_SIZE / SPRITES_TEXTURE_SIZE;

export const MAX_WORLD_SPRITES_PER_AXIS = 65536;
export const MAX_WORLD_DEPTH = 256;

export const TILES_PER_CHUNK_GRID_AXIS = 32;
export const TILES_PER_CHUNK_GRID = TILES_PER_CHUNK_GRID_AXIS ** 2;

export const ERROR_GAME_OBJECT_SPRITE_INDEX = 0;
export const UNDEFINED_GAME_OBJECT_SPRITE_INDEX = 1;
export const DEFAULT_GAME_OBJECT_SPRITE_INDEX = 2;

// X,Y,Z,0 - 4
// R,T,U   - 4
// 0,1,2,3 - 4

// u16 - pos
// u16 - tex
// u16 - alfa

// 32 pos x
// 32 pos y
// 16 tex atlas
//  8 tex x
//  8 tex y
//  8 tex w
//  8 tex h
//  8 alpha

// 1 1
// 2 4
// 3 16
// 4 64
// 5 256
// 6 1024
// 7 4096
// 8 16384
// 9 65536
// A 262144
