import { GACommunicator, provideGACommunicator } from "../core/action/communication.ts";
import { GADefinition } from "../core/action/foundation.ts";
import { ServiceResolver } from "../dependency/service.ts";

export interface GABusSubscriber {
  subscribe<TData>(definition: GADefinition<TData>, data: TData): Promise<void>;
}

export class MutationGABusSubscriber implements GABusSubscriber {
  public constructor(
    public communicator: GACommunicator,
  ) {}

  public async subscribe<TData>(definition: GADefinition<TData>, data: TData): Promise<void> {
    this.communicator.sender.send(definition, data);
  }
}

export function provideMutationGABusSubscriber(resolver: ServiceResolver) {
  return new MutationGABusSubscriber(
    resolver.resolve(provideGACommunicator),
  );
}
