import { Breaker } from "../utils/breaker.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { GACodec, provideGACodec } from "./codec.ts";
import { GAProcessor, provideGAProcessor } from "./processor.ts";
import { provideGARequestor } from "./requestor.ts";
import { Logger, provideGlobalLogger } from "../logger/logger.ts";

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
        throw new Breaker("unknown-error-then-processing-game-request", { definition, envelope, error });
      }
    }
  }
}

export function provideGAReceiver(resolver: ServiceResolver) {
  return new UniversalGAReceiver(
    resolver.resolve(provideGACodec),
    resolver.resolve(provideGlobalLogger),
    [
      resolver.resolve(provideGARequestor),
      resolver.resolve(provideGAProcessor),
    ],
  );
}
