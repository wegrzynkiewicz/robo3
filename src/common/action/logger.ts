import { ServiceResolver } from "../dependency/service.ts";
import { Logger, provideScopedLogger } from "../logger/global.ts";
import { GABusSubscriber } from "./bus.ts";
import { GADefinition, GAEnvelope } from "./define.ts";

export class GALogger implements GABusSubscriber {
  public constructor(
    public readonly logger: Logger,
  ) {}

  public async subscribe<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): Promise<void> {
    this.logger.silly("game-action", { definition, envelope });
  }
}

export function provideScopedGALogger(resolver: ServiceResolver) {
  return new GALogger(
    resolver.resolve(provideScopedLogger),
  ); 
}
