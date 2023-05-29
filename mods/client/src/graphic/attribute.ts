export type AttributeType =
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

export interface VertexAttribute {
  accessor: Accessor;
  axes: number;
  byteSize: number;
  divisor: number;
  glType: AttributeType;
  isInteger: boolean;
  isSigned: boolean;
  location: number;
  name: string;
  normalize: boolean;
  shaderType: string;
  totalByteSize: number;
}

export function toShaderLine(va: VertexAttribute) {
  const { location, name, shaderType } = va;
  return `layout(location = ${location}) in ${shaderType} ${name};`;
}
