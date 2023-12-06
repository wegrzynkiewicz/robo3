import { Looper } from "../MainLoop.ts";
import { KAMatcher, KAShortCutsChecker } from "../keyboard/KAMatcher.ts";

export interface PhaseController extends Looper, KAShortCutsChecker {
  readonly name: string;
}

export class PhaseConnector implements PhaseController {
  public readonly loopers: Looper[] = [];
  public readonly kaShortCutsCheckers: KAShortCutsChecker[] = [];

  public constructor(
    public readonly name: string,
  ) {}

  public loop(now: DOMHighResTimeStamp): void {
    for (const controller of this.loopers) {
      controller.loop(now);
    }
  }

  public async checkKAShortCuts(matcher: KAMatcher): Promise<void> {
    for (const controller of this.kaShortCutsCheckers) {
      await controller.checkKAShortCuts(matcher);
    }
  }
}
