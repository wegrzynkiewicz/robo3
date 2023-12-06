import { Breaker } from "../../../utils/breaker.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { KAMatcher, provideKAMatcher } from "../keyboard/KAMatcher.ts";
import { provideGamePhase } from "./GamePhase.ts";
import { PhaseController } from "./Phase.ts";

export class PhaseManager {
  public constructor(
    public currentPhase: PhaseController,
    public kaMatcher: KAMatcher,
  ) {}

  public setCurrentPhase(phase: PhaseController) {
    this.currentPhase = phase;
  }

  public loop(now: DOMHighResTimeStamp): void {
    const { currentPhase } = this;
    try {
      currentPhase.loop(now);
    } catch (error: unknown) {
      throw new Breaker("error-in-phase-manager", { currentPhase, error });
    }
  }

  public async processKeyboard(): Promise<void> {
    const { currentPhase, kaMatcher } = this;
    try {
      await currentPhase.checkKAShortCuts(kaMatcher);
    } catch (error: unknown) {
      throw new Breaker("error-in-phase-manager", { currentPhase, error });
    }
  }
}

export function providePhaseManager(resolver: ServiceResolver) {
  return new PhaseManager(
    resolver.resolve(provideGamePhase),
    resolver.resolve(provideKAMatcher),
  );
}
