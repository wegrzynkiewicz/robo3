import { ServiceResolver, registerService } from "../../../core/dependency/service.ts";
import { webGLService } from "./WebGL.ts";

const { COLOR_BUFFER_BIT, TRIANGLES } = WebGL2RenderingContext;

export class Renderer {
  public constructor(
    public readonly gl: WebGL2RenderingContext,
  ) {

  }

  public draw(): void {
    this.gl.clear(COLOR_BUFFER_BIT);
    this.gl.drawArraysInstanced(TRIANGLES, 0, 6, 1000);
  }
}

export const rendererService = registerService({
  async provider(resolver: ServiceResolver): Promise<Renderer> {
    const gl = await resolver.resolve(webGLService);
    return new Renderer(gl);
  },
});
