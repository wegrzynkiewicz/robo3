import { Breaker } from "./asserts.ts";

export interface Logger {
  error(message: string, data?: Record<string, unknown>): void;
}

export const logger = {
  warn: console.warn,
  info: console.info,
  error: (message: string, data?: Record<string, unknown>) => {
    const breaker = new Breaker(message, data);
    console.error(breaker.stack);
  },
};
