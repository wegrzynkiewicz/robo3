import { Breaker } from "../../../common/asserts.ts";
import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { KAProcessor } from "../keyboard/KAProcessor.ts";
import { gamePhaseService } from "./GamePhase.ts";
import { PhaseController } from "./Phase.ts";

export class PhaseManager {
  public constructor(
    public currentPhase: PhaseController,
  ) { }

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

  public async checkKAShortCuts(processor: KAProcessor): Promise<void> {
    const { currentPhase } = this;
    try {
      await currentPhase.checkKAShortCuts(processor);
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
    );
  },
});
