import { Breaker } from "../common/asserts.ts";
import { WithOptional } from "../common/useful.ts";

export type Service<TInstance> = {
  provider(resolver: ServiceResolver): Promise<TInstance>;
  singleton: boolean;
};

export type AnyService = Service<any>;

const singletons = new WeakMap<AnyService, unknown>();

export class ServiceResolver {
  protected readonly instances = new WeakMap<AnyService, unknown>();
  protected readonly promises = new WeakMap<AnyService, Promise<unknown>>();

  inject<TInstance>(service: Service<TInstance>, instance: TInstance): void {
    this.instances.set(service, instance);
    if (service.singleton) {
      singletons.set(service, instance);
    }
  }

  async resolve<TInstance>(service: Service<TInstance>): Promise<TInstance> {
    const singletonService = singletons.get(service);
    if (singletonService) {
      return singletonService as TInstance;
    }
    const existingInstances = this.instances.get(service);
    if (existingInstances) {
      return existingInstances as TInstance;
    }
    const existingPromise = this.promises.get(service);
    if (existingPromise) {
      return existingPromise as Promise<TInstance>;
    }
    const { provider, singleton } = service;
    try {
      const promise = provider(this);
      this.promises.set(service, promise);
      const instance = await promise;
      if (singleton) {
        singletons.set(service, instance);
      }
      this.instances.set(service, instance);
      this.promises.delete(service);
      return promise;
    } catch (error) {
      throw new Breaker("error-when-resolving-service", { service, error });
    }
  }
}

export function registerService<TInstance>(
  service: WithOptional<Service<TInstance>, "singleton">,
): Service<TInstance> {
  const { provider, singleton } = service;
  return {
    provider,
    singleton: singleton ?? false,
  };
}
