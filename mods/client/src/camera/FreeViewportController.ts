import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { Point } from "../../../math/Point.ts";
import { Looper } from "../MainLoop.ts";
import { KeyShortCut, KeyState } from "../keyboard/KeyShortCut.ts";
import { Keyboard, keyboardService } from "../keyboard/Keyboard.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";
import { FreeCamera, freeCameraService } from "./FreeCamera.ts";

function createHolder(code: string, name: string, vector: Point) {
  const kaDefinition = registerKADefinition({
    name: `ka.free-camera.movement.${name}`,
    shortCuts: [
      new KeyShortCut(
        new KeyState(code),
      ),
    ],
  });
  return { kaDefinition, vector };
}

const holders = [
  createHolder("KeyW", "up", { x: 0, y: -1 }),
  createHolder("KeyS", "down", { x: 0, y: 1 }),
  createHolder("KeyA", "left", { x: -1, y: 0 }),
  createHolder("KeyD", "right", { x: 1, y: 0 }),
];

export class FreeViewportController implements Looper {
  public speed = 32;
  public x = 1800;
  public y = 1800;

  public constructor(
    public readonly freeCamera: FreeCamera,
    public readonly keyboard: Keyboard,
  ) { }

  public loop() {
    for (const holder of holders) {
      if (this.keyboard.isHold(holder.kaDefinition)) {
        this.x += this.speed * holder.vector.x;
        this.y += this.speed * holder.vector.y;
      }
    }
    this.freeCamera.update(this.x, this.y);
  }
}

export const freeViewportControllerService = registerService({
  name: 'freeViewportController',
  async provider(resolver: ServiceResolver): Promise<FreeViewportController> {
    return new FreeViewportController(
      await resolver.resolve(freeCameraService),
      await resolver.resolve(keyboardService),
    );
  },
});