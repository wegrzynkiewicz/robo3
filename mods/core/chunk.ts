import { Accessor } from "./binary.ts";
import { Position } from "./numbers.ts";

export const enum ChunkLayerType {
  SINGLE = 1,
  LIST = 2,
  GRID = 3,
}

export interface SingleChunkLayer {
  type: ChunkLayerType.SINGLE;
  value: number;
}

export interface GridChunkLayer {
  accessor: Accessor;
  type: ChunkLayerType.GRID;
}

export type ChunkLayer = GridChunkLayer | SingleChunkLayer;

export interface ComplexGOInstance {
  m: string;
  t: number;
  p: number;
}

export interface Chunk {
  chunkId: string;
  sgos: ComplexGOInstance[];
  layers: ChunkLayer[];
  pos: Position;
  p: number;
  spaceId: string;
}
