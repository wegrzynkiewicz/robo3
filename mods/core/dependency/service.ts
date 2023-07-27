import { Breaker } from "../../common/asserts.ts";
import { WithOptional } from "../../common/useful.ts";

export type ServiceProvider<TInstance> = (...args: any) => Promise<TInstance>;
export type ServiceKey = string | symbol;
export type ServiceMap = Map<ServiceKey, Service<unknown>>;
export type EmptyObject = Record<string | number | symbol, never>;

export type Service<
  TInstance,
  TProvider extends ServiceProvider<TInstance> = ServiceProvider<TInstance>,
  TDependencies = Parameters<TProvider>[0],
> = {
  dependencies: {
    [K in keyof TDependencies]: Service<TDependencies[K]>;
  };
  provider: TProvider;
  singleton: boolean;
};

export function registerService<TInstance>(service: WithOptional<Service<TInstance>, "dependencies" | "singleton">): Service<TInstance> {
  const { dependencies, provider, singleton } = service;
  return {
    dependencies: dependencies ?? {},
    provider: provider!,
    singleton: singleton ?? true,
  };
}

export class ServiceResolver {
  protected readonly promises = new WeakMap<Service<unknown>, Promise<unknown>>();
  protected readonly singletonServiceMap = new WeakMap<Service<unknown>, unknown>();

  async resolve<TInstance>(service: Service<TInstance>): Promise<TInstance> {
    const singletonService = this.singletonServiceMap.get(service);
    if (singletonService) {
      return singletonService as TInstance;
    }
    const existingPromise = this.promises.get(service);
    if (existingPromise === undefined) {
      const promise = this.invokeProvider(service);
      this.promises.set(service, promise);
      return promise;
    }
    return existingPromise as TInstance;
  }

  async invokeProvider<TInstance>(service: Service<TInstance>): Promise<TInstance> {
    try {
      const { dependencies, provider, singleton } = service;
      const args = await this.resolveDependencies(dependencies);
      const instance = await provider(args);
      if (singleton === true) {
        this.singletonServiceMap.set(service, instance);
      }
      this.promises.delete(service);
      return instance;
    } catch (error) {
      throw new Breaker("error-when-resolving-service", { service, error });
    }
  }

  async resolveDependencies(dependencies?: Record<ServiceKey, Service<unknown>>): Promise<unknown> {
    if (dependencies === undefined) {
      return {};
    }
    const instances: [ServiceKey, unknown][] = [];
    const entries = Object.entries(dependencies);
    const promises = entries.map(async ([key, service]) => {
      const instance = await this.resolve(service);
      instances.push([key, instance]);
    });
    await Promise.all(promises);
    const args = Object.fromEntries(instances);
    return args;
  }
}

export const serviceResolver = new ServiceResolver();
export function resolveService<TInstance>(service: Service<TInstance>): Promise<TInstance> {
  return serviceResolver.resolve(service);
}
