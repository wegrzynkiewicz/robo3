import { Breaker } from "../../common/asserts.ts";

export type Container = any;
export type Key = string | symbol;
export type ServiceProvider<TService> = (...args: any) => Promise<TService>;
export type UnknownServiceDef = ServiceDef<ServiceProvider<unknown>, unknown>;
export type ServiceDefKey = string | symbol;
export type ServicesDefs = Record<ServiceDefKey, UnknownServiceDef>;
export type ServiceDefMap = Map<ServiceDefKey, UnknownServiceDef>;

export type ServiceDef<
  TProvider extends ServiceProvider<TService>,
  TService = ReturnType<TProvider> extends Promise<infer TService> ? TService : never,
  TDependencies = undefined extends Parameters<TProvider>[0] ? Record<string | number | symbol, never> : Parameters<TProvider>[0],
> = {
  dependencies: {
    [K in keyof TDependencies]: ServiceDef<ServiceProvider<TDependencies[K]>, TDependencies[K]>;
  };
  namespaces: string[],
  provider: TProvider;
  singleton?: boolean
};

export function createContainer(): Container {
  const container: Container = {};
  container['self'] = container;
  container.get = (serviceKey: Key) => {
    return container[serviceKey];
  };
  return container;
}

export const singletonServiceMap = new WeakMap<UnknownServiceDef, unknown>();

export function registerService<
  TProvider extends ServiceProvider<TService>,
  TService = ReturnType<TProvider> extends Promise<infer TService> ? TService : never,
>(
  serviceDef: ServiceDef<TProvider, TService>,
): ServiceDef<TProvider, TService> {
  return serviceDef;
}

function createInjectorIntoContainer(map: Map<ServiceDefKey, UnknownServiceDef>) {
  return function injectIntoContainer(services: ServicesDefs) {
    for (const [key, def] of Object.entries(services)) {
      if (map.has(key)) {
        throw new Breaker('service-with-key-already-exists-into-container', { key });
      }
      map.set(key, def);
    }
  }
}

const staticServiceDefsMap = new Map<ServiceDefKey, UnknownServiceDef>()
export const injectIntoStaticContainer = createInjectorIntoContainer(staticServiceDefsMap);
const scopedServiceDefsMap = new Map<ServiceDefKey, UnknownServiceDef>()
export const injectIntoScopedContainer = createInjectorIntoContainer(scopedServiceDefsMap);

export const scopedContainer = registerService({
  dependencies: {},
  namespaces: ["scoped", "static"],
  provider: async () => (createContainer()),
})
injectIntoScopedContainer({ scopedContainer });

export async function resolveServiceContainer(defs: ServiceDefMap): Promise<Container> {
  const map = new WeakMap<UnknownServiceDef, Promise<unknown>>();

  async function resolveProviderDependencies(deps: [ServiceDefKey, UnknownServiceDef][]): Promise<Record<string, unknown>> {
    const services: [ServiceDefKey, unknown][] = [];
    const promises = deps.map(async ([depKey, depDef]) => {
      const service = await resolveDef(depDef);
      services.push([depKey, service]);
    });
    await Promise.all(promises);
    const providerDeps = Object.fromEntries(services);
    return providerDeps;
  }

  async function createResolve(def: UnknownServiceDef): Promise<unknown> {
    try {
      const entries = Object.entries(def.dependencies);
      const providerDeps = await resolveProviderDependencies(entries);
      const service = await def.provider(providerDeps);
      return service;
    } catch (error) {
      throw new Breaker('error-when-resolving-service', { def, error })
    }
  }

  function resolveDef(def: UnknownServiceDef): Promise<unknown> {
    const servicePromise = map.get(def);
    if (servicePromise === undefined) {
      const promise = createResolve(def);
      map.set(def, promise);
      return promise;
    }
    return servicePromise;
  }

  const entries = [...defs.entries()];
  const services = await resolveProviderDependencies(entries);
  for (const [key, instance] of Object.entries(services)) {
    services.container[key] = instance;
  }
  return container;
}
