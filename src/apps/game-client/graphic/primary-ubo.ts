import { ServiceResolver } from "../../../common/dependency/service.ts";
import { provideWebGL } from "./web-gl.ts";
import { createBuffer } from "./utilities.ts";

const { DYNAMIC_DRAW, UNIFORM_BUFFER } = WebGL2RenderingContext;

export class PrimaryUBO {
  public readonly projectionMatrix: Float32Array;
  public readonly viewMatrix: Float32Array;
  public readonly texSpriteGraphicSize: Float32Array;
  public readonly texSpriteIndicesSize: Float32Array;
  public readonly pixelOffset: Float32Array;

  protected readonly buffer: ArrayBuffer;
  protected readonly byteLength: number;
  protected readonly glBuffer: WebGLBuffer;
  protected readonly dataView: DataView;

  public constructor(
    protected readonly gl: WebGL2RenderingContext,
    protected readonly uniformBufferBase: number,
  ) {
    this.glBuffer = createBuffer(gl);
    this.byteLength = 16 * (4 + 4 + 1 + 1 + 1);
    this.buffer = new ArrayBuffer(this.byteLength);
    this.dataView = new DataView(this.buffer);

    [
      this.projectionMatrix,
      this.viewMatrix,
      this.texSpriteGraphicSize,
      this.texSpriteIndicesSize,
      this.pixelOffset,
    ] = [
      new Float32Array(this.buffer, 0x00 * 16, 16),
      new Float32Array(this.buffer, 0x04 * 16, 16),
      new Float32Array(this.buffer, 0x08 * 16, 4),
      new Float32Array(this.buffer, 0x09 * 16, 4),
      new Float32Array(this.buffer, 0x0a * 16, 4),
    ];

    // TODO: hardcode
    this.texSpriteGraphicSize[0] = 1024;
    this.texSpriteGraphicSize[1] = 1024;
    this.texSpriteGraphicSize[2] = 1;

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

export function providePrimaryUBO(resolver: ServiceResolver) {
  return new PrimaryUBO(
    resolver.resolve(provideWebGL),
    0,
  );
}
