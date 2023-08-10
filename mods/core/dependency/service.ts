import { Breaker } from "../../common/asserts.ts";
import { WithOptional } from "../../common/useful.ts";

type ServiceKey = string | symbol;
type ServiceInstance<TProvider extends (...args: any) => any> = ReturnType<TProvider> extends Promise<infer TInstance> ? TInstance : never;
type ServiceUnknown = Service<(...args: any) => any>;
type ServiceDependencies<TProvider extends (...args: any) => any> = Parameters<TProvider>[0];
type ServiceProvider<TInstance> = (...args: any) => Promise<TInstance>;
type ServiceOption<TProvider extends (...args: any) => any> = Parameters<TProvider>[1];

export type Service<TProvider extends (...args: any) => any> = {
  dependencies?: {
    [K in keyof ServiceDependencies<TProvider>]: Service<ServiceProvider<ServiceDependencies<TProvider>[K]>>;
  };
  provider: TProvider;
  singleton: boolean;
};

export function registerService<TProvider extends (...args: any) => any>(
  service: WithOptional<Service<TProvider>, "singleton">,
): Service<TProvider> {
  const { dependencies, provider, singleton } = service;
  return {
    dependencies,
    provider,
    singleton: singleton ?? false,
  };
}

export class ServiceResolver {
  protected readonly promises = new WeakMap<ServiceUnknown, Promise<unknown>>();
  protected readonly singletonServiceMap = new WeakMap<ServiceUnknown, unknown>();

  async resolve<TProvider extends (...args: any) => any>(
    service: Service<TProvider>,
    options?: ServiceOption<TProvider>,
  ): Promise<ServiceInstance<TProvider>> {
    const singletonService = this.singletonServiceMap.get(service);
    if (singletonService) {
      return singletonService as ServiceInstance<TProvider>;
    }
    const existingPromise = this.promises.get(service);
    if (existingPromise === undefined) {
      const promise = this.invokeProvider(service, options);
      this.promises.set(service, promise);
      return promise;
    }
    return existingPromise as ServiceInstance<TProvider>;
  }

  async invokeProvider<TProvider extends (...args: any) => any>(
    service: Service<TProvider>,
    options?: ServiceOption<TProvider>,
  ): Promise<ServiceInstance<TProvider>> {
    try {
      const { dependencies, provider, singleton } = service;
      const args = await this.resolveDependencies(dependencies, options);
      const instance = await provider(args, options);
      if (singleton === true) {
        this.singletonServiceMap.set(service, instance);
      }
      this.promises.delete(service);
      return instance;
    } catch (error) {
      throw new Breaker("error-when-resolving-service", { service, error });
    }
  }

  async resolveDependencies<TProvider extends (...args: any) => any>(
    dependencies?: Record<ServiceKey, ServiceUnknown>,
    options?: ServiceOption<TProvider>,
  ): Promise<unknown> {
    if (dependencies === undefined) {
      return {};
    }
    const instances: [ServiceKey, unknown][] = [];
    const entries = Object.entries(dependencies);
    const promises = entries.map(async ([key, service]) => {
      const instance = await this.resolve(service, options);
      instances.push([key, instance]);
    });
    await Promise.all(promises);
    const args = Object.fromEntries(instances);
    return args;
  }
}

export const serviceResolver = new ServiceResolver();
export const resolveService = serviceResolver.resolve.bind(serviceResolver);
