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
    public readonly tilesProgram: TilesProgram,
    public readonly tilesSceneBuilder: TilesSceneBuilder,
    public readonly primaryUBO: PrimaryUBO,
  ) {

  }

  public update(): void {
    this.tilesSceneBuilder.build();
    this.tilesProgram.bind();
    
    // TODO: UBO
    const { projectionMatrix, viewMatrix } = this.primaryUBO;
    const projectionLoc1 = this.gl.getUniformLocation(this.tilesProgram.glProgram, "u_Projection");
    const viewMatrixLoc = this.gl.getUniformLocation(this.tilesProgram.glProgram, "u_View");
    this.gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    this.gl.uniformMatrix4fv(projectionLoc1, false, projectionMatrix);
    this.gl.drawArraysInstanced(TRIANGLES, 0, SINGLE_TILE_VERTICES_COUNT, this.tilesSceneBuilder.visibleTiles);
  }
}

export const tilesRendererService = registerService({
  async provider(resolver: ServiceResolver): Promise<TilesRenderer> {
    const [gl, tilesProgram, tilesSceneBuilder, primaryUBO] = await Promise.all([
      resolver.resolve(webGLService),
      resolver.resolve(tilesProgramService),
      resolver.resolve(tilesSceneBuilderService),
      resolver.resolve(primaryUBOService),
    ]);
    return new TilesRenderer(gl, tilesProgram, tilesSceneBuilder, primaryUBO);
  },
});
