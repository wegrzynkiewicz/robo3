import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { PrimaryUBO, providePrimaryUBO } from "../primary-ubo.ts";
import { provideWebGL } from "../web-gl.ts";
import { provideTilesProgram, TilesProgram } from "./tiles-program.ts";
import { provideTilesSceneBuilder, TilesSceneBuilder } from "./tiles-scene-builder.ts";

const { COLOR_BUFFER_BIT, TRIANGLES } = WebGL2RenderingContext;

export interface Renderer {
  loop(): void;
}

export const SINGLE_TILE_VERTICES_COUNT = 6;

export class TilesRenderer implements Renderer {
  public constructor(
    public readonly gl: WebGL2RenderingContext,
    public readonly primaryUBO: PrimaryUBO,
    public readonly tilesProgram: TilesProgram,
    public readonly tilesSceneBuilder: TilesSceneBuilder,
  ) {}

  public loop(): void {
    this.gl.clear(COLOR_BUFFER_BIT);
    this.tilesSceneBuilder.build();
    this.tilesProgram.bind();
    this.primaryUBO.update();
    this.gl.drawArraysInstanced(TRIANGLES, 0, SINGLE_TILE_VERTICES_COUNT, this.tilesSceneBuilder.tiles.visibleTiles);
  }
}

export function provideTilesRenderer(resolver: ServiceResolver) {
  return new TilesRenderer(
    resolver.resolve(provideWebGL),
    resolver.resolve(providePrimaryUBO),
    resolver.resolve(provideTilesProgram),
    resolver.resolve(provideTilesSceneBuilder),
  );
}
