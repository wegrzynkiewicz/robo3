import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { webGLService } from "./WebGL.ts";
import { createBuffer } from "./utilities.ts";

const { DYNAMIC_DRAW, UNIFORM_BUFFER } = WebGL2RenderingContext;

export class PrimaryUBO {
  public readonly buffer: ArrayBuffer;
  public readonly byteLength: number;
  public readonly glBuffer: WebGLBuffer;
  public readonly projectionMatrix: Float32Array;
  public readonly viewMatrix: Float32Array;
  public readonly dataView: DataView;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
  ) {
    this.glBuffer = createBuffer(gl);
    this.byteLength = 16 * 4 + 16 * 4;
    this.buffer = new ArrayBuffer(this.byteLength);
    this.dataView = new DataView(this.buffer);
    this.projectionMatrix = new Float32Array(this.buffer, 0, 16);
    this.viewMatrix = new Float32Array(this.buffer, 64, 16);
    this.bind();
    this.gl.bufferData(UNIFORM_BUFFER, this.byteLength, DYNAMIC_DRAW);
    this.gl.bindBufferBase(UNIFORM_BUFFER, 0, this.glBuffer);
  }

  public bind(): void {
    this.gl.bindBuffer(UNIFORM_BUFFER, this.glBuffer);
  }

  public update(): void {
    this.bind();
    this.gl.bufferSubData(UNIFORM_BUFFER, 0, this.dataView, 0, this.byteLength);
  }
}

export const primaryUBOService = registerService({
  async provider(resolver: ServiceResolver): Promise<PrimaryUBO> {
    return new PrimaryUBO(
      await resolver.resolve(webGLService),
    );
  },
});
