export type GLType =
  | WebGL2RenderingContext["BOOL"]
  | WebGL2RenderingContext["BYTE"]
  | WebGL2RenderingContext["FLOAT"]
  | WebGL2RenderingContext["INT"]
  | WebGL2RenderingContext["SHORT"]
  | WebGL2RenderingContext["UNSIGNED_BYTE"]
  | WebGL2RenderingContext["UNSIGNED_INT"]
  | WebGL2RenderingContext["UNSIGNED_SHORT"];

export type Accessor =
  | Float32ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor;

export interface VertexAttributeType {
  readonly accessor: Accessor;
  readonly axes: number;
  readonly byteLength: number;
  readonly glType: GLType;
  readonly isInteger: boolean;
  readonly isSigned: boolean;
  readonly shaderType: string;
}

export function vec(axes: number): VertexAttributeType {
  return {
    accessor: Float32Array,
    axes,
    byteLength: axes * 4,
    glType: WebGL2RenderingContext["FLOAT"],
    isInteger: false,
    isSigned: false,
    shaderType: `vec${axes}`,
  };
}

export function float(): VertexAttributeType {
  return {
    accessor: Float32Array,
    axes: 1,
    byteLength: 4,
    glType: WebGL2RenderingContext["FLOAT"],
    isInteger: false,
    isSigned: false,
    shaderType: `float`,
  };
}

export type SignedType = "i16" | "i32" | "i8";
export type UnsignedType = "u16" | "u32" | "u8";
export type MapEntry = { accessor: Accessor; glType: GLType; size: number };

const map: Record<SignedType | UnsignedType, MapEntry> = {
  "i16": { accessor: Uint32Array, glType: WebGL2RenderingContext["UNSIGNED_INT"], size: 1 },
  "i32": { accessor: Uint32Array, glType: WebGL2RenderingContext["UNSIGNED_INT"], size: 2 },
  "i8": { accessor: Uint32Array, glType: WebGL2RenderingContext["UNSIGNED_INT"], size: 4 },
  "u16": { accessor: Uint16Array, glType: WebGL2RenderingContext["UNSIGNED_SHORT"], size: 1 },
  "u32": { accessor: Uint32Array, glType: WebGL2RenderingContext["UNSIGNED_INT"], size: 2 },
  "u8": { accessor: Uint8Array, glType: WebGL2RenderingContext["UNSIGNED_BYTE"], size: 4 },
};

export function uvec(axes: number, type: UnsignedType): VertexAttributeType {
  const { accessor, glType, size } = map[type];
  return {
    accessor,
    axes,
    byteLength: axes * size,
    glType,
    isInteger: true,
    isSigned: false,
    shaderType: `uvec${axes}`,
  };
}

export function ivec(axes: number, type: SignedType): VertexAttributeType {
  const { accessor, glType, size } = map[type];
  return {
    accessor,
    axes,
    byteLength: axes * size,
    glType,
    isInteger: true,
    isSigned: true,
    shaderType: `ivec${axes}`,
  };
}
