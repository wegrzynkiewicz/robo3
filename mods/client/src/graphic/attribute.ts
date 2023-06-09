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

function resolveIntegerTypeByByte(byte: number): number {
  switch (byte) {
    case 1:
      return WebGL2RenderingContext["BYTE"];
    case 2:
      return WebGL2RenderingContext["SHORT"];
    case 4:
      return WebGL2RenderingContext["INT"];
    default:
      return 0;
  }
}

export function attribute(text: string): VertexAttribute {
  const segments = text.split(":");
  const [location, structure, name, divisor] = segments;
  const chars = structure.split("");
  const type = chars.shift();

  let glType: AttributeType = WebGL2RenderingContext["FLOAT"];
  let axes = 1;
  let isInteger = false;
  let isSigned = false;
  let shaderType = "";
  if (type === "v") {
    axes = parseInt(chars.shift()!);
  }
  const scalar = chars.shift();
  const byteSize = parseInt(chars.shift()!);
  switch (scalar) {
    case "b": {
      glType = WebGL2RenderingContext["BOOL"];
      shaderType = axes > 1 ? `bvec${axes}` : "bool";
      break;
    }
    case "f": {
      shaderType = axes > 1 ? `vec${axes}` : "float";
      break;
    }
    case "i": {
      isSigned = true;
      isInteger = true;
      glType = resolveIntegerTypeByByte(byteSize) as AttributeType;
      shaderType = axes > 1 ? `ivec${axes}` : "int";
      break;
    }
    case "u": {
      isInteger = true;
      glType = resolveIntegerTypeByByte(byteSize) + 1 as AttributeType;
      shaderType = axes > 1 ? `uvec${axes}` : "uint";
    }
  }
  const totalByteSize = byteSize * axes;

  return {
    accessor: Float32Array,
    axes,
    byteSize,
    divisor: divisor ? parseInt(divisor) : 0,
    glType,
    isInteger,
    isSigned,
    location: parseInt(location),
    name,
    normalize: false,
    shaderType,
    totalByteSize,
  };
}
