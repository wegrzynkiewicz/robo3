import { Breaker } from "../../utils/breaker.ts";

export function provideWebSocket(): WebSocket {
  throw new Breaker("web-socket-service-should-be-injected");
}
