import { Breaker } from "../../common/asserts.ts";
import { Logger, logger } from "../../common/logger.ts";
import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { GACodec, gaCodecService } from "./codec.ts";
import { GAProcessor, gaProcessorService } from "./processor.ts";
import { gaRequestorService } from "./requestor.ts";

export interface GAReceiver {
  receive(data: unknown): Promise<void>;
}

export class UniversalGAReceiver implements GAReceiver {
  public constructor(
    public readonly codec: GACodec,
    public readonly logger: Logger,
    public readonly processors: GAProcessor[],
  ) {}

  public async receive(message: unknown): Promise<void> {
    const [definition, envelope] = this.codec.decode(message);
    for (const processor of this.processors) {
      try {
        await processor.process(definition, envelope);
      } catch (error) {
        const errorOptions = { definition, envelope, error };
        if (error instanceof Breaker) {
          this.logger.error("error-then-receiving-game-action-envelope", errorOptions);
        } else {
          throw new Breaker("unknown-error-then-processing-game-request", errorOptions);
        }
      }
    }
  }
}

export const gaReceiverService = registerService({
  name: 'gaReceiver',
  async provider(resolver: ServiceResolver): Promise<GAReceiver> {
    return new UniversalGAReceiver(
      await resolver.resolve(gaCodecService),
      logger,
      [
        await resolver.resolve(gaRequestorService),
        await resolver.resolve(gaProcessorService),
      ],
    );
  },
});
