import { Breaker } from "../../common/asserts.ts";
import { Logger, logger } from "../../common/logger.ts";
import { registerService, ServiceResolver } from "../dependency/service.ts";
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
  ) {
  }

  public async receive(message: unknown): Promise<void> {
    const [definition, envelope] = this.codec.decode(message);
    let processed = false;
    for (const processor of this.processors) {
      if (!processor.canProcess(definition, envelope)) {
        continue;
      }
      const { id } = envelope;
      try {
        await processor.process(definition, envelope);
      } catch (error) {
        const isBreaker = error instanceof Breaker;
        const errorOptions = { definition, envelope: { id }, error };
        this.logger.error("error-then-receiving-game-action-envelope", errorOptions);
        if (!isBreaker) {
          throw new Breaker("unknown-error-then-processing-game-request", errorOptions);
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
      codec,
      ...processors
    ] = await Promise.all([
      resolver.resolve(gaCodecService),
      resolver.resolve(gaRequestorService),
      resolver.resolve(gaProcessorService),
    ]);
    return new UniversalGAReceiver(codec, logger, processors);
  },
});