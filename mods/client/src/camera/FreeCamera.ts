import { registerService, ServiceResolver } from "../../../core/dependency/service.ts";
import { Point } from "../../../math/Point.ts";
import { Viewport, viewportService } from "../graphic/Viewport.ts";
import { KeyShortCut, KeyState } from "../keyboard/KeyShortCut.ts";
import { Keyboard, keyboardService } from "../keyboard/Keyboard.ts";
import { AnyKADefinition, registerKADefinition } from "../keyboard/foundation.ts";

function createHolder(code: string, name: string, vector: Point) {
  const kaDefinition = registerKADefinition({
    name: `ka.free-camera.movement.${name}`,
    shortCuts: [
      new KeyShortCut(
        new KeyState(code),
      ),
    ],
  });
  return { kaDefinition, vector }
}

const holders = [
  createHolder('KeyW', 'up', { x: 0, y: -1 }),
  createHolder('KeyS', 'down', { x: 0, y: 1 }),
  createHolder('KeyA', 'left', { x: -1, y: 0 }),
  createHolder('KeyD', 'right', { x: 1, y: 0 }),
];

export class FreeCamera {

  public speed = 16;
  public x = 0;
  public y = 0;

  public constructor(
    public readonly viewport: Viewport,
    public readonly keyboard: Keyboard,
  ) {

  }

  public update() {
    for (const holder of holders) {
      if (this.isHold(holder.kaDefinition)) {
        this.x += this.speed * holder.vector.x;
        this.y += this.speed * holder.vector.y;
      }
    }
    this.viewport.lookAt(this.x, this.y);
  }

  protected isHold(kaDefinition: AnyKADefinition): boolean {
    for (const shortCut of kaDefinition.currentShortCuts) {
      if (shortCut.isHold(this.keyboard)) {
        return true;
      }
    }
    return false;
  }
}

export const freeCameraService = registerService({
  async provider(resolver: ServiceResolver): Promise<FreeCamera> {
    return new FreeCamera(
      await resolver.resolve(viewportService),
      await resolver.resolve(keyboardService),
    );
  },
});
