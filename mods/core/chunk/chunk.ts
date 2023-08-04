import { Position } from "../numbers.ts";
import { decodeChunkId } from "./chunkId.ts";

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
  extended: ChunkComplexGameObject;
}

export interface ChunkBinding {
  chunk: Chunk;
  position: Position;
  spaceId: number;
}

export class ChunkManager {
  protected readonly chunks = new Map<string, ChunkBinding>();
  public register(chunk: Chunk) {
    const { chunkId } = chunk;
    const { position, spaceId } = decodeChunkId(chunkId);
    const chunkBinding: ChunkBinding = {
      chunk,
      position,
      spaceId,
    };
    this.chunks.set(chunkId, chunkBinding);
  }
}
