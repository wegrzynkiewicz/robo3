import { createBuffer } from "./utilities.ts";

const { ARRAY_BUFFER, DYNAMIC_DRAW } = WebGL2RenderingContext;

export class DynamicDrawBuffer {
  public bytesSent = 0;
  public dataView: DataView;
  public typedArray: Float32Array;
  protected readonly arrayBuffer: ArrayBuffer;
  protected readonly glBuffer: WebGLBuffer;

  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly byteLength: number,
  ) {
    this.glBuffer = createBuffer(gl);
    this.gl.bindBuffer(ARRAY_BUFFER, this.glBuffer);
    this.gl.bufferData(ARRAY_BUFFER, this.byteLength, DYNAMIC_DRAW);
    this.arrayBuffer = new ArrayBuffer(this.byteLength);
    this.dataView = new DataView(this.arrayBuffer);
    this.typedArray = new Float32Array(this.arrayBuffer);
  }

  public bind() {
    this.gl.bindBuffer(ARRAY_BUFFER, this.glBuffer);
  }

  public update(byteLength: number) {
    this.bytesSent = byteLength;
    console.log(this.dataView.buffer);
    this.gl.bindBuffer(ARRAY_BUFFER, this.glBuffer);
    this.gl.bufferSubData(ARRAY_BUFFER, 0, this.dataView, 0, byteLength);
  }
}
