import { Breaker } from "../../common/asserts.ts";
import { Logger, logger } from "../../common/logger.ts";
import { registerService, ServiceResolver } from "../dependency/service.ts";
import { GAManager, gaManagerService } from "./foundation.ts";
import { GAProcessor, gaProcessorService } from "./processor.ts";
import { gaRequestorService } from "./requestor.ts";

export interface GAReceiver {
  receive(data: unknown): Promise<void>;
}

export class UniversalGAReceiver implements GAReceiver {
  public constructor(
    public readonly logger: Logger,
    public readonly manager: GAManager,
    public readonly processors: GAProcessor[],
  ) {
  }

  public async receive(message: unknown): Promise<void> {
    const [definition, envelope] = this.manager.decode(message);
    let processed = false;
    for (const processor of this.processors) {
      if (!processor.canProcess(definition, envelope)) {
        continue;
      }
      try {
        await processor.process(definition, envelope);
      } catch (error) {
        const isBreaker = error instanceof Breaker;
        this.logger.error("error-then-processing-game-action-envelope", { definition, envelope, error });
        if (!isBreaker) {
          throw new Breaker("unknown-error-then-processing-game-request", { definition, envelope, error });
        }
      }
      processed = true;
    }
    if (processed === false) {
      throw new Breaker("received-message-for-unknown-processor", { definition, envelope });
    }
  }
}

export const gaReceiverService = registerService({
  async provider(resolver: ServiceResolver): Promise<GAReceiver> {
    const [
      gaManager,
      ...processors
    ] = await Promise.all([
      resolver.resolve(gaManagerService),
      resolver.resolve(gaRequestorService),
      resolver.resolve(gaProcessorService),
    ]);
    return new UniversalGAReceiver(logger, gaManager, processors);
  },
});
