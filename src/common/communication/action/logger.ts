import { ServiceResolver } from "../../dependency/service.ts";
import { Logger, provideLogger } from "../../logger/global.ts";
import { CABusSubscriber } from "./bus.ts";
import { CADefinition, CAEnvelope } from "./define.ts";

export class CALogger implements CABusSubscriber {
  public constructor(
    public readonly logger: Logger,
  ) {}

  public async subscribe<TData>(definition: CADefinition<TData>, envelope: CAEnvelope<TData>): Promise<void> {
    this.logger.silly("game-action", { definition, envelope });
  }
}

export function provideCALogger(resolver: ServiceResolver) {
  return new CALogger(
    resolver.resolve(provideLogger),
  ); 
}
