import { ServiceResolver } from "../../dependency/service.ts";
import { GADefinition, GAEnvelope } from "./define.ts";
import { GAIncomingQueue, provideScopedGAIncomingQueue } from "./incoming-queue.ts";

export class GADispatcher {
  protected id = 1;
  public constructor(
    protected readonly incomingQueue: GAIncomingQueue,
  ) { }

  public dispatch<TData>(definition: GADefinition<TData>, params: TData) {
    const { kind } = definition;
    params = params ?? {} as TData;
    const id = this.id++;
    const envelope: GAEnvelope<TData> = { id, kind, params };
    this.incomingQueue.push(envelope);
  }
}

export function provideScopedGADispatcher(resolver: ServiceResolver) {
  return new GADispatcher(
    resolver.resolve(provideScopedGAIncomingQueue),
  );
}
