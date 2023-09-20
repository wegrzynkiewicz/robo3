import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { webGLService } from "../WebGL.ts";
import { TilesProgram, tilesProgramService } from "./TilesProgram.ts";
import { TilesSceneBuilder, tilesSceneBuilderService } from "./TilesSceneBuilder.ts";

const { TRIANGLES } = WebGL2RenderingContext;

export interface Renderer {
  draw(): void;
}

export const SINGLE_TILE_VERTICES_COUNT = 6;

export class TilesRenderer implements Renderer {
  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly tilesProgram: TilesProgram,
    public readonly tilesSceneBuilder: TilesSceneBuilder,
  ) {

  }

  public draw(): void {
    this.tilesSceneBuilder.build();
    this.tilesProgram.bind();
    this.gl.drawArraysInstanced(TRIANGLES, 0, SINGLE_TILE_VERTICES_COUNT, this.tilesSceneBuilder.visibleTiles);
  }
}

export const tilesRendererService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesRenderer> {
    const [gl, tilesProgram, tilesSceneBuilder] = await Promise.all([
      resolver.resolve(webGLService),
      resolver.resolve(tilesProgramService),
      resolver.resolve(tilesSceneBuilderService),
    ]);
    return new TilesRenderer(gl, tilesProgram, tilesSceneBuilder);
  },
});
