import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { MoveDirection } from "../../../domain-client/player-move/move.ts";
import { Looper } from "../MainLoop.ts";
import { KeyShortCut, KeyState } from "../keyboard/KeyShortCut.ts";
import { Keyboard, keyboardService } from "../keyboard/Keyboard.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";

function createHolder(code: string, name: string, direct: MoveDirection) {
  const kaDefinition = registerKADefinition({
    name: `ka.self-player-controller.movement.${name}`,
    shortCuts: [
      new KeyShortCut(
        new KeyState(code),
      ),
    ],
  });
  return { kaDefinition, direct };
}

const holders = [
  createHolder("KeyW", "up", MoveDirection.W),
  createHolder("KeyS", "down", MoveDirection.S),
  createHolder("KeyA", "left", MoveDirection.A),
  createHolder("KeyD", "right", MoveDirection.D),
];

export class SelfPlayerController implements Looper {
  public previousDirect: MoveDirection = MoveDirection.S;

  public constructor(
    public readonly keyboard: Keyboard,
  ) {}

  public loop(): void {
    let currentDirect = MoveDirection.S;
    for (const { direct, kaDefinition } of holders) {
      if (this.keyboard.isHold(kaDefinition)) {
        currentDirect = currentDirect | direct;
      }
    }

    // Protect from two direction at the same time
    if ((currentDirect & 0b1100) === 0b1100) {
      currentDirect = currentDirect & 0b0011;
    }
    if ((currentDirect & 0b0011) === 0b0011) {
      currentDirect = currentDirect & 0b1100;
    }

    if (currentDirect !== this.previousDirect) {
      this.previousDirect = currentDirect;
    }
  }
}

export const selfPlayerControllerService = registerService({
  name: "selfPlayerController",
  async provider(resolver: ServiceResolver): Promise<SelfPlayerController> {
    return new SelfPlayerController(
      await resolver.resolve(keyboardService),
    );
  },
});
