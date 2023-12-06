import { Breaker } from "../../../common/breaker.ts";
import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { KAMatcher, kaMatcherService } from "../keyboard/KAMatcher.ts";
import { gamePhaseService } from "./GamePhase.ts";
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

export const phaseManagerService = registerService({
  name: "phaseManager",
  async provider(resolver: ServiceResolver): Promise<PhaseManager> {
    return new PhaseManager(
      await resolver.resolve(gamePhaseService),
      await resolver.resolve(kaMatcherService),
    );
  },
});
