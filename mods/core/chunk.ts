export interface ChunkLayerCommon {
  layerId: number;
}

export const enum ChunkLayerType {
  GRID = "GRID",
  LIST = "LIST",
  SINGLE = "SINGLE",
}

export interface SingleChunkLayer extends ChunkLayerCommon {
  type: ChunkLayerType.SINGLE;
  value: number;
}

export interface GridChunkLayer extends ChunkLayerCommon {
  accessor: Accessor;
  type: ChunkLayerType.GRID;
}

export interface ListChunkLayer extends ChunkLayerCommon {
  accessor: Accessor;
  type: ChunkLayerType.LIST;
}

export type ChunkLayer = GridChunkLayer | ListChunkLayer | SingleChunkLayer;

export interface Chunk {
  chunkId: number;
  layers: Map<number, ChunkLayer>;
  worldId: number;
}

export type Serialized<T> = {
  [K in keyof T]: T[K] extends Map<unknown, infer MapValueType> ? MapValueType[] : T[K];
};

export interface Binary {
  binaryId: number;
  buffer: ArrayBuffer;
}

export const enum AccessorType {
  Arr = "Arr",
  U08 = "U08",
  U16 = "U16",
  U32 = "U32",
  S08 = "S08",
  S16 = "S16",
  S32 = "S32",
  F32 = "F32",
  F64 = "F64",
}

export type MappingAccessorType = {
  [AccessorType.Arr]: DataView;
  [AccessorType.U08]: Uint8Array;
  [AccessorType.U16]: Uint16Array;
  [AccessorType.U32]: Uint32Array;
  [AccessorType.S08]: Int8Array;
  [AccessorType.S16]: Int16Array;
  [AccessorType.S32]: Int32Array;
  [AccessorType.F32]: Float32Array;
  [AccessorType.F64]: Float64Array;
};

export interface Accessor {
  binaryId: number;
  byteOffset: number;
  elements: number;
  type: AccessorType;
}

const layer1: GridChunkLayer = {
  accessor: {
    binaryId: 0,
    byteOffset: 0,
    elements: 4096,
    type: AccessorType.U16,
  },
  layerId: 3,
  type: ChunkLayerType.GRID,
};

const layer2: SingleChunkLayer = {
  layerId: 4,
  type: ChunkLayerType.SINGLE,
  value: 0x0000eeee,
};

const chunk: Chunk = {
  chunkId: 1,
  worldId: 2,
  layers: [
    undefined,
    undefined,
    layer1,
    layer2,
  ],
};

function mapToArray(key: any, value: any) {
  if (value instanceof Map) {
    return [...value.values()];
  }
  return value;
}

const json = JSON.stringify(chunk, mapToArray);
const parsed = JSON.parse(json) as Serialized<Chunk>;
console.log(parsed);
const layers = new Map(parsed.layers.map((e) => [e.layerId, e]));
const chunk1 = { ...parsed, layers };

const ab = new ArrayBuffer(40);
const dv = new DataView(ab);

const ar = new Uint16Array(ab, 4, 3);

ar[0] = 0x1111;
ar[1] = 0x2222;
ar[2] = 0x3333;
ar[3] = 0x4444;

console.log(ab);
