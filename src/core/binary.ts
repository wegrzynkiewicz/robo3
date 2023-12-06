export const enum AccessorType {
  U08 = 0x11,
  U16 = 0x12,
  U32 = 0x14,
  S08 = 0x21,
  S16 = 0x22,
  S32 = 0x24,
  F32 = 0x44,
  F64 = 0x48,
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

export class BinaryManager {
  public readonly binaries = new Map<number, ArrayBuffer>();
}
