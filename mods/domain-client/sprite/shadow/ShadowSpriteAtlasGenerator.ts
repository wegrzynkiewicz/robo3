import { createUnifiedCanvas } from "../../../canvas/mod.ts";
import { registerService } from "../../../dependency/service.ts";

type ShadowSampler = (x: number, y: number) => number;

export class ShadowSpriteAtlasGenerator {
  protected readonly context = createUnifiedCanvas(6 * 32, 3 * 32);

  constructor(
    public readonly intensive: number,
  ) {}

  protected blendColor(x1: number, y1: number, x2: number, y2: number): number {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return this.intensive * distance / 16;
  }

  protected put(startX: number, startY: number, callback: ShadowSampler): void {
    const sourceX = startX * 16;
    const sourceY = startY * 16;
    const image = this.context.getImageData(sourceX, sourceY, 16, 16);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const index = (y * 16 + x) * 4 + 3;
        image.data[index] = callback(x, y);
      }
    }
    this.context.putImageData(image, sourceX, sourceY);
  }

  public generate(): ImageData {
    const fill = () => this.intensive;
    const empty = () => 0;
    const cornNW: ShadowSampler = (x, y) => this.blendColor(x, y, 16, 16);
    const cornNE: ShadowSampler = (x, y) => this.blendColor(x, y, 0, 16);
    const cornSW: ShadowSampler = (x, y) => this.blendColor(x, y, 16, 0);
    const cornSE: ShadowSampler = (x, y) => this.blendColor(x, y, 0, 0);
    const edgeN: ShadowSampler = (_, y) => this.blendColor(0, y, 0, 16);
    const edgeS: ShadowSampler = (_, y) => this.blendColor(0, y, 0, 0);
    const edgeW: ShadowSampler = (x, _) => this.blendColor(x, 0, 16, 0);
    const edgeE: ShadowSampler = (x, _) => this.blendColor(x, 0, 0, 0);

    this.put(0, 0, empty);
    this.put(1, 0, edgeE);
    this.put(0, 1, edgeS);
    this.put(1, 1, cornSE);

    this.put(2, 0, edgeW);
    this.put(3, 0, edgeE);
    this.put(2, 1, cornSW);
    this.put(3, 1, cornSE);

    this.put(4, 0, edgeW);
    this.put(5, 0, empty);
    this.put(4, 1, cornSW);
    this.put(5, 1, edgeS);

    this.put(0, 2, edgeN);
    this.put(1, 2, cornNE);
    this.put(0, 3, edgeS);
    this.put(1, 3, cornSE);

    this.put(2, 2, cornNW);
    this.put(3, 2, cornNE);
    this.put(2, 3, cornSW);
    this.put(3, 3, cornSE);

    this.put(4, 2, cornNW);
    this.put(5, 2, edgeN);
    this.put(4, 3, cornSW);
    this.put(5, 3, edgeS);

    this.put(0, 4, edgeN);
    this.put(1, 4, cornNE);
    this.put(0, 5, empty);
    this.put(1, 5, edgeE);

    this.put(2, 4, cornNW);
    this.put(3, 4, cornNE);
    this.put(2, 5, edgeW);
    this.put(3, 5, edgeE);

    this.put(4, 4, cornNW);
    this.put(5, 4, edgeN);
    this.put(4, 5, edgeW);
    this.put(5, 5, empty);

    this.put(7, 1, (x, y) => this.intensive - this.blendColor(x, y, 16, 16));
    this.put(8, 1, edgeS);
    this.put(9, 1, edgeS);
    this.put(10, 1, (x, y) => this.intensive - this.blendColor(x, y, 0, 16));

    this.put(7, 2, edgeE);
    this.put(7, 3, edgeE);

    this.put(8, 2, fill);
    this.put(8, 3, fill);
    this.put(9, 2, fill);
    this.put(9, 3, fill);

    this.put(10, 2, edgeW);
    this.put(10, 3, edgeW);

    this.put(7, 4, (x, y) => this.intensive - this.blendColor(x, y, 16, 0));
    this.put(8, 4, edgeN);
    this.put(9, 4, edgeN);
    this.put(10, 4, (x, y) => this.intensive - this.blendColor(x, y, 0, 0));

    const { height, width } = this.context;
    const imageData = this.context.getImageData(0, 0, width, height);

    return imageData;
  }
}

export const shadowSpriteAtlasGeneratorService = registerService({
  async provider(): Promise<ShadowSpriteAtlasGenerator> {
    return new ShadowSpriteAtlasGenerator(
      80,
    );
  },
});
