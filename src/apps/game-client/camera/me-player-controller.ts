import { ServiceResolver } from "../../../common/dependency/service.ts";
import { MoveDirection } from "../../../actions/player-move/me-player-move-ga.ts";
import { Looper } from "../main-loop.ts";
import { KeyShortCut, KeyState } from "../keyboard/key-short-cut.ts";
import { Keyboard, provideKeyboard } from "../keyboard/keyboard.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";
import { provideMainUABus, UABus } from "../ua/uabus.ts";
import { mePlayerMoveUA } from "../../../actions/player-move/me-player-move-ua.ts";

function createHolder(code: string, name: string, direct: MoveDirection) {
  const kaDefinition = registerKADefinition({
    name: `ka.me-player-controller.movement.${name}`,
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
  createHolder("KeyS", "down", MoveDirection.X),
  createHolder("KeyA", "left", MoveDirection.A),
  createHolder("KeyD", "right", MoveDirection.D),
];

export class MePlayerController implements Looper {
  public previousDirect: MoveDirection = MoveDirection.S;

  public constructor(
    public readonly keyboard: Keyboard,
    public readonly uaBus: UABus,
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
      void this.uaBus.dispatch(mePlayerMoveUA, currentDirect);
    }
  }
}

export function provideMePlayerController(resolver: ServiceResolver) {
  return new MePlayerController(
    resolver.resolve(provideKeyboard),
    resolver.resolve(provideMainUABus),
  );
}
