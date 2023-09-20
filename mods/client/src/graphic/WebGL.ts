import { Breaker } from "../../../common/asserts.ts";
import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";

export const canvasService = registerService({
  async provider(): Promise<HTMLCanvasElement> {
    throw new Breaker("canvas-service-must-be-injected");
  },
});

function replaceOriginalFunction(gl: WebGL2RenderingContext, props: string) {
  const oldFunction = (gl as any)[props];
  let bound: unknown;
  (gl as any)[props] = (arg: unknown): void => {
    if (bound === arg) {
      return;
    }
    oldFunction.call(gl, arg);
    bound = arg;
  };
}

export const webGLService = registerService({
  async provider(resolver: ServiceResolver): Promise<WebGL2RenderingContext> {
    const canvas = await resolver.resolve(canvasService);
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      desynchronized: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
      stencil: false,
    })!;

    const oldBindBuffer = gl.bindBuffer;
    const bound: Record<number, unknown> = {};
    gl.bindBuffer = (target: number, buffer: WebGLBuffer | null): void => {
      if (bound[target] === buffer) {
        return;
      }
      oldBindBuffer.call(gl, target, buffer);
      bound[target] = buffer;
    };

    replaceOriginalFunction(gl, "useProgram");
    replaceOriginalFunction(gl, "bindVertexArray");

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.clearColor(1.0, 0.4, 0.8, 1.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    return gl;
  },
});
