import { ChunkId } from "./chunkId.ts";

export interface ChunkComplexGameObject {
  gid: string;
  lid: number;
  pos: number;
  typ: number;
}

export interface Chunk {
  blockId: number;
  chunkId: string;
  tiles: number;
  extended: ChunkComplexGameObject[];
}

export interface ChunkBinding {
  chunk: Chunk;
  chunkId: ChunkId,
}

export class ChunkManager {
  protected readonly chunks = new Map<string, ChunkBinding>();
  public register(chunk: Chunk) {
    const { chunkId: hex } = chunk;
    const chunkId = ChunkId.fromHex(hex);
    const chunkBinding: ChunkBinding = {
      chunk,
      chunkId,
    };
    this.chunks.set(hex, chunkBinding);
  }
}
