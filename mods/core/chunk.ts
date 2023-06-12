import { Accessor } from "./binary.ts";
import { Position } from "./numbers.ts";
import { GlobalId } from "./world.ts";

export interface ChunkLayerCommon {
  depth: number;
  layerId: number;
}

export const enum ChunkLayerSetup {
  GRID = "GRID",
  SINGLE = "SINGLE",
}

export interface SingleChunkLayer extends ChunkLayerCommon {
  setup: ChunkLayerSetup.SINGLE;
  value: number;
}

export interface GridChunkLayer extends ChunkLayerCommon {
  accessor: Accessor;
  setup: ChunkLayerSetup.GRID;
}

export type ChunkLayer = GridChunkLayer | SingleChunkLayer;

export interface TileInstance {
  pos: number;
  sid: number;
}

export interface Chunk {
  chunkId: GlobalId;
  egos: TileInstance[];
  layers: ChunkLayer[];
  position: Position;
  positionIndex: number;
  spaceId: GlobalId;
}
