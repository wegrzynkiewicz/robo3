export const TEXTURE_SIZE = 512;
export const SPRITE_SIZE = 32;
export const SPRITES_COUNT_PER_AXIS = TEXTURE_SIZE / SPRITE_SIZE;
export const SPRITE_STRIDE_NORMALIZED = SPRITE_SIZE / TEXTURE_SIZE;

export const MAX_WORLD_TILES_PER_AXIS = 65536;
export const MAX_WORLD_DEPTH = 256;

export const BLOCKS_PER_CHUNK_AXIS = 16;


// X,Y,Z,0 - 4
// R,T,U   - 4
// 0,1,2,3 - 4

// u16 - pos
// u16 - tex
// u16 - alfa


