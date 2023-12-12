import { Breaker } from "../utils/breaker.ts";

export interface Provider<TInstance> {
  (resolver: ServiceResolver): TInstance;
}

export type AnyProvider = Provider<any>;

export class ServiceResolver {
  public readonly instances = new Map<AnyProvider, unknown>();

  public inject<TInstance>(provider: Provider<TInstance>, instance: TInstance): void {
    this.instances.set(provider, instance);
  }

  public resolve<TInstance>(provider: Provider<TInstance>): TInstance {
    const existingInstances = this.instances.get(provider);
    if (existingInstances) {
      return existingInstances as TInstance;
    }
    try {
      const instance = provider(this);
      this.instances.set(provider, instance);
      return instance;
    } catch (error) {
      throw new Breaker("error-when-resolving-provider", { provider: provider.name, error });
    }
  }

  public clone(providers: AnyProvider[]): ServiceResolver {
    const resolver = new ServiceResolver();
    for (const provider of providers) {
      const instance = this.resolve(provider);
      resolver.inject(provider, instance);
    }
    return resolver;
  }
}

export function provideMainServiceResolver(): ServiceResolver {
  throw new Breaker("main-service-resolver-must-be-injected");
}
