import { TILES_PER_CHUNK_GRID_AXIS } from "../core/vars.ts";
import { createNoise2D } from "./deps.ts";

const axis = TILES_PER_CHUNK_GRID_AXIS;

export class NoiseGenerator {
  protected readonly noise: (x: number, y: number) => number;

  public constructor(
    public readonly seed: number,
  ) {
    this.noise = createNoise2D(() => seed);
  }

  public genChunkTerrain(buffer: Uint8Array, offsetX: number, offsetY: number): void {
    const noise = this.noise;
    let i = 0;
    let e = 0;
    for (let y = 0; y < axis; y++) {
      for (let x = 0; x < axis; x++) {
        const nx = (x + offsetX * axis) / 1024;
        const ny = (y + offsetY * axis) / 1024;

        const e1 = 4.0 * noise(0.20 * nx, 0.20 * ny);
        const e2 = 2.0 * noise(2.00 * nx, 2.00 * ny);
        const e3 = 1.0 * noise(4.00 * nx, 4.00 * ny);
        const e4 = 0.1 * noise(30.00 * nx, 30.00 * ny);

        e = (e1 + e2 + e3 + e4) / (4.0 + 2.0 + 1.0 + 0.1);
        e = e / 2 + 0.5;
        e = Math.round(e * 16) / 16;
        e = e * 255;

        buffer[i++] = e;
      }
    }
  }
}
