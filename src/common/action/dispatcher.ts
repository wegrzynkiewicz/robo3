import { ServiceResolver } from "../dependency/service.ts";
import { GABus, provideMainGABus, provideScopedSendingGABus, } from "./bus.ts";
import { GADefinition, GADispatcher, GAEnvelope } from "./define.ts";

export class UniversalGADispatcher implements GADispatcher {
  public constructor(
    public readonly gaBus: GABus,
  ) { }

  public send<TData>(definition: GADefinition<TData>, params: TData): void {
    const { kind } = definition;
    const envelope: GAEnvelope<TData> = { id: 0, kind, params };
    this.sendEnvelope(definition, envelope);
  }

  public sendEnvelope<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): void {
    this.gaBus.dispatch(definition, envelope);
  }
}

export function provideMainGADispatcher(resolver: ServiceResolver) {
  return new UniversalGADispatcher(
    resolver.resolve(provideMainGABus),
  );
}

export function provideScopedGADispatcher(resolver: ServiceResolver) {
  return new UniversalGADispatcher(
    resolver.resolve(provideScopedSendingGABus),
  );
}
