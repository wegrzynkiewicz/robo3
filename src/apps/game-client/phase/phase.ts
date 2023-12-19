import { Looper } from "../../../common/simulator/looper.ts";
import { KAMatcher, KAShortCutsChecker } from "../keyboard/kamatcher.ts";

export interface PhaseController extends Looper, KAShortCutsChecker {
  readonly name: string;
}

export class PhaseConnector implements PhaseController {
  public readonly loopers: Looper[] = [];
  public readonly kaShortCutsCheckers: KAShortCutsChecker[] = [];

  public constructor(
    public readonly name: string,
  ) {}

  public loop(deltaTime: number): void {
    for (const controller of this.loopers) {
      controller.loop(deltaTime);
    }
  }

  public async checkKAShortCuts(matcher: KAMatcher): Promise<void> {
    for (const controller of this.kaShortCutsCheckers) {
      await controller.checkKAShortCuts(matcher);
    }
  }
}
