import { assertNonNull } from "../../../common/utils/asserts.ts";
import { Breaker } from "../../../common/utils/breaker.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";

const { TEXTURE0, TEXTURE_2D, TEXTURE_2D_ARRAY } = WebGL2RenderingContext;

export function provideCanvas(): HTMLCanvasElement {
  throw new Breaker("canvas-service-must-be-injected");
}

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

interface TextureUnit {
  [TEXTURE_2D]: WebGLTexture | null;
  [TEXTURE_2D_ARRAY]: WebGLTexture | null;
}

function createTextureUnits(count: number): TextureUnit[] {
  const textureUnits: TextureUnit[] = [];
  for (let i = 0; i < count; i++) {
    const unit: TextureUnit = {
      [TEXTURE_2D]: null,
      [TEXTURE_2D_ARRAY]: null,
    };
    textureUnits.push(unit);
  }
  return textureUnits;
}

export function provideWebGL(resolver: ServiceResolver) {
  const canvas = resolver.resolve(provideCanvas);
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
  });
  assertNonNull(gl, "cannot-create-webgl2-context");

  const oldBindBuffer = gl.bindBuffer;
  const bound: Record<number, unknown> = {};
  gl.bindBuffer = (target: number, buffer: WebGLBuffer | null): void => {
    if (bound[target] === buffer) {
      return;
    }
    oldBindBuffer.call(gl, target, buffer);
    bound[target] = buffer;
  };

  const maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  const textureUnits = createTextureUnits(maxTextureUnits);
  let activeTextureUnit = 0;

  const oldActiveTexture = gl.activeTexture;
  gl.activeTexture = function (unit: number): void {
    const index = unit - TEXTURE0;
    if (index > (maxTextureUnits - 1)) {
      throw new Error("unexpected-texture-unit");
    }
    if (activeTextureUnit === index) {
      return;
    }
    oldActiveTexture.call(gl, unit);
    activeTextureUnit = index;
  };

  const oldBindTexture = gl.bindTexture;
  gl.bindTexture = function (target: number, texture: WebGLTexture | null): void {
    const textureUnit = textureUnits[activeTextureUnit] as any;
    if (textureUnit[target] === texture) {
      return;
    }
    oldBindTexture.call(gl, target, texture);
    textureUnit[target] = texture;
  };

  replaceOriginalFunction(gl, "useProgram");
  replaceOriginalFunction(gl, "bindVertexArray");

  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.clearColor(1.0, 0.0, 1.0, 1.0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return gl;
}
