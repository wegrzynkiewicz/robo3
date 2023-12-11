import { Breaker } from "../utils/breaker.ts";

export function provideScopedWebSocket(): WebSocket {
  throw new Breaker("web-socket-service-should-be-injected");
}
