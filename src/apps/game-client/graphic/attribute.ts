import { logger } from "../../../common/logger/logger.ts";
import { isPositiveNumber } from "../../../common/utils/asserts.ts";
import { VertexAttributeType } from "./types.ts";

export class VertexAttribute {
  public readonly byteOffset: number;
  public readonly byteStride: number;
  public readonly divisor: number;
  public readonly location: number;
  public readonly name: string;
  public readonly type: VertexAttributeType;
  public constructor(
    { byteOffset, byteStride, divisor, location, name, type }: {
      byteOffset: number;
      byteStride?: number;
      divisor?: number;
      location: number;
      name: string;
      type: VertexAttributeType;
    },
  ) {
    this.byteOffset = byteOffset;
    this.byteStride = byteStride ?? 0;
    this.divisor = divisor ?? 0;
    this.location = location;
    this.name = name;
    this.type = type;
  }

  public toShaderLine() {
    const { location, name, type: { shaderType } } = this;
    return `layout(location = ${location}) in ${shaderType} ${name};`;
  }

  public enableVertexAttribute(gl: WebGL2RenderingContext, glProgram: WebGLProgram): void {
    const { byteOffset, byteStride, divisor, name, type: { axes, glType, isInteger } } = this;
    const location = gl.getAttribLocation(glProgram, name);
    if (!isPositiveNumber(location)) {
      logger.warn("attribute-location-not-found-in-shader", { va: this });
      return;
    }
    gl.enableVertexAttribArray(location);
    if (isInteger) {
      gl.vertexAttribIPointer(location, axes, glType, byteStride, byteOffset);
    } else {
      gl.vertexAttribPointer(location, axes, glType, false, byteStride, byteOffset);
    }
    if (divisor > 0) {
      gl.vertexAttribDivisor(location, divisor);
    }
  }
}
