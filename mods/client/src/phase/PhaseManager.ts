import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { KAShortCutProcessor, kaShortCutProcessorService } from "../keyboard/KAShortCutProcessor.ts";
import { AnyKADefinition, kaManagerService } from "../keyboard/foundation.ts";
import { KAManager } from "../keyboard/foundation.ts";
import { AnyUADefinition } from "../ua/foundation.ts";
import { gamePhaseService } from "./GamePhase.ts";

export interface Phase {
  getAvailableUADefinition(): AnyUADefinition[];
}

export class PhaseManager {
  public constructor(
    public readonly kaManager: KAManager,
    public readonly kaShortCutProcessor: KAShortCutProcessor,
    protected currentPhase: Phase,
  ) {}

  public setCurrentPhase(phase: Phase) {
    this.currentPhase = phase;
  }

  public processKeyboard(): void {
    const kaDefs: AnyKADefinition[] = [];
    for (const def of this.currentPhase.getAvailableUADefinition()) {
      const list = this.kaManager.byUADefinition.fetch(def);
      kaDefs.push(...list);
    }
    this.kaShortCutProcessor.process(kaDefs);
  }
}

export const phaseManagerService = registerService({
  async provider(resolver: ServiceResolver): Promise<PhaseManager> {
    return new PhaseManager(
      await resolver.resolve(kaManagerService),
      await resolver.resolve(kaShortCutProcessorService),
      await resolver.resolve(gamePhaseService),
    );
  },
});
