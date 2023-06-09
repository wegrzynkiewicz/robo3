export const enum AccessorType {
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

export interface Binary {
  binaryId: number;
  buffer: ArrayBuffer;
}
