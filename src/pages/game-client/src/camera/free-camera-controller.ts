import { ServiceResolver } from "../../../../common/dependency/service.ts";
import { Pos2D } from "../../../../common/math/pos2d.ts";
import { Looper } from "../main-loop.ts";
import { KeyShortCut, KeyState } from "../keyboard/key-short-cut.ts";
import { Keyboard, provideKeyboard } from "../keyboard/keyboard.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";
import { FreeCamera, provideFreeCamera } from "./free-camera.ts";

function createHolder(code: string, name: string, vector: Pos2D) {
  const kaDefinition = registerKADefinition({
    name: `ka.free-camera-controller.movement.${name}`,
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

export class FreeCameraController implements Looper {
  public speed = 32;
  public x = 1800;
  public y = 1800;

  public constructor(
    public readonly freeCamera: FreeCamera,
    public readonly keyboard: Keyboard,
  ) {}

  public loop(): void {
    for (const holder of holders) {
      if (this.keyboard.isHold(holder.kaDefinition)) {
        this.x += this.speed * holder.vector.x;
        this.y += this.speed * holder.vector.y;
      }
    }
    this.freeCamera.update(this.x, this.y);
  }
}

export function provideFreeCameraController(resolver: ServiceResolver) {
  return new FreeCameraController(
    resolver.resolve(provideFreeCamera),
    resolver.resolve(provideKeyboard),
  );
}
