import { registerService, ServiceResolver } from "../../../../core/dependency/service.ts";
import { PrimaryUBO, primaryUBOService } from "../PrimaryUBO.ts";
import { webGLService } from "../WebGL.ts";
import { TilesProgram, tilesProgramService } from "./TilesProgram.ts";
import { TilesSceneBuilder, tilesSceneBuilderService } from "./TilesSceneBuilder.ts";

const { TRIANGLES } = WebGL2RenderingContext;

export interface Renderer {
  update(): void;
}

export const SINGLE_TILE_VERTICES_COUNT = 6;

export class TilesRenderer implements Renderer {
  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly primaryUBO: PrimaryUBO,
    public readonly tilesProgram: TilesProgram,
    public readonly tilesSceneBuilder: TilesSceneBuilder,
  ) {

  }

  public update(): void {
    this.tilesSceneBuilder.build();
    this.tilesProgram.bind();
    this.primaryUBO.update();
    this.gl.drawArraysInstanced(TRIANGLES, 0, SINGLE_TILE_VERTICES_COUNT, this.tilesSceneBuilder.visibleTiles);
  }
}

export const tilesRendererService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesRenderer> {
    return new TilesRenderer(
      await resolver.resolve(webGLService),
      await resolver.resolve(primaryUBOService),
      await resolver.resolve(tilesProgramService),
      await resolver.resolve(tilesSceneBuilderService),
    );
  },
});
