import { GADefinition, GASender } from "../common/action/define.ts";
import { provideScopedGASender } from "../common/action/online-sender.ts";
import { ServiceResolver } from "../common/dependency/service.ts";

export interface GABusSubscriber {
  subscribe<TData>(definition: GADefinition<TData>, data: TData): Promise<void>;
}

export class MutationGABusSubscriber implements GABusSubscriber {
  public constructor(
    public sender: GASender,
  ) {}

  public async subscribe<TData>(definition: GADefinition<TData>, data: TData): Promise<void> {
    this.sender.send(definition, data);
  }
}

export function provideMutationGABusSubscriber(resolver: ServiceResolver) {
  return new MutationGABusSubscriber(
    resolver.resolve(provideScopedGASender),
  );
}
