import { ServiceResolver } from "../../dependency/service.ts";
import { CABus, provideMainCABus, provideSendingCABus, } from "./bus.ts";
import { CADefinition, CADispatcher, CAEnvelope } from "./define.ts";

export class UniversalCADispatcher implements CADispatcher {
  public constructor(
    public readonly gaBus: CABus,
  ) { }

  public send<TData>(definition: CADefinition<TData>, params: TData): void {
    const { kind } = definition;
    params = params ?? {} as TData;
    const envelope: CAEnvelope<TData> = { id: 0, kind, params };
    this.sendEnvelope(definition, envelope);
  }

  public sendEnvelope<TData>(definition: CADefinition<TData>, envelope: CAEnvelope<TData>): void {
    this.gaBus.dispatch(definition, envelope);
  }
}

export function provideMainCADispatcher(resolver: ServiceResolver) {
  return new UniversalCADispatcher(
    resolver.resolve(provideMainCABus),
  );
}

export function provideCADispatcher(resolver: ServiceResolver) {
  return new UniversalCADispatcher(
    resolver.resolve(provideSendingCABus),
  );
}
