export type Context = any;
export type Key = string | symbol;

function createContext(name: string): Context {
  const context: Context = {};
  context[name] = context;
  context.get = (serviceKey: Key) => {
    return context[serviceKey];
  };
  return context;
}

export const createStaticContext = () => createContext("staticContext");
export const createScopedContext = () => createContext("scopedContext");
