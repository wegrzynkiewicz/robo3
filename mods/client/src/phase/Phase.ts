import { Looper } from "../MainLoop.ts";
import { KAProcessor, KAShortCutChecker } from "../keyboard/KAProcessor.ts";

export interface PhaseController extends Looper, KAShortCutChecker {
  readonly name: string;
}

export class PhaseConnector implements PhaseController {
  public readonly loopers: Looper[] = [];
  public readonly kaShortCutCheckers: KAShortCutChecker[] = [];

  public constructor(
    public readonly name: string,
  ) { }

  public loop(now: DOMHighResTimeStamp): void {
    for (const controller of this.loopers) {
      controller.loop(now);
    }
  }

  public async checkKAShortCuts(processor: KAProcessor): Promise<void> {
    for (const controller of this.kaShortCutCheckers) {
      await controller.checkKAShortCuts(processor);
    }
  }
}
