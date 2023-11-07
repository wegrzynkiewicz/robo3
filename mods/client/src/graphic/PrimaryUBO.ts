import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { webGLService } from "./WebGL.ts";
import { createBuffer } from "./utilities.ts";

const { DYNAMIC_DRAW, UNIFORM_BUFFER } = WebGL2RenderingContext;

export class PrimaryUBO {

  public readonly projectionMatrix: Float32Array;
  public readonly viewMatrix: Float32Array;
  public readonly textureSpriteGraphicSize: Float32Array;
  public readonly textureSpriteIndicesSize: Float32Array;
  public readonly tileOffset: Float32Array;

  protected readonly buffer: ArrayBuffer;
  protected readonly byteLength: number;
  protected readonly glBuffer: WebGLBuffer;
  protected readonly dataView: DataView;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    protected readonly uniformBufferBase: number,
  ) {
    this.glBuffer = createBuffer(gl);
    this.byteLength = 16 * (4 + 4 + 1 + 1 + 1);
    this.buffer = new ArrayBuffer(this.byteLength);
    this.dataView = new DataView(this.buffer);

    [
      this.projectionMatrix,
      this.viewMatrix,
      this.textureSpriteGraphicSize,
      this.textureSpriteIndicesSize,
      this.tileOffset,
    ] = [
      new Float32Array(this.buffer, 0x00 * 16, 16),
      new Float32Array(this.buffer, 0x04 * 16, 16),
      new Float32Array(this.buffer, 0x08 * 16, 4),
      new Float32Array(this.buffer, 0x09 * 16, 4),
      new Float32Array(this.buffer, 0x0a * 16, 4),
    ];

    this.bind();
    this.gl.bufferData(UNIFORM_BUFFER, this.byteLength, DYNAMIC_DRAW);
    this.gl.bindBufferBase(UNIFORM_BUFFER, uniformBufferBase, this.glBuffer);
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
      0,
    );
  },
});
