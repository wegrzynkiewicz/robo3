import { ServiceResolver } from "../dependency/service.ts";
import { JADefinition, JAEnvelope } from "./define.ts";
import { JAIncomingQueue, provideJAIncomingQueue } from "./incoming-queue.ts";

export class JADispatcher {
  protected id = 1;
  public constructor(
    protected readonly incomingQueue: JAIncomingQueue,
  ) { }

  public dispatch<TData>(definition: JADefinition<TData>, params: TData) {
    const { kind } = definition;
    params = params ?? {} as TData;
    const id = this.id++;
    const envelope: JAEnvelope<TData> = { id, kind, params };
    this.incomingQueue.push(definition, envelope);
  }
}

export function provideJADispatcher(resolver: ServiceResolver) {
  return new JADispatcher(
    resolver.resolve(provideJAIncomingQueue),
  );
}
