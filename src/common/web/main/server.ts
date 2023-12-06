import { Breaker } from "../../utils/breaker.ts";
import { provideGlobalLogger } from "../../../core/logger.ts";
import { ServiceResolver } from "../../dependency/service.ts";
import { Router } from "../router.ts";
import { WebServer } from "../server.ts";

export function provideMainWebServerConfig() {
  return {
    hostname: "0.0.0.0",
    name: "main",
    port: 8080,
  };
}

export function provideMainWebRouter(): Router {
  throw new Breaker("main-web-router-must-be-injected");
}

export function provideWebServer(resolver: ServiceResolver) {
  return new WebServer(
    resolver.resolve(provideMainWebServerConfig),
    resolver.resolve(provideMainWebRouter),
    resolver.resolve(provideGlobalLogger),
  );
}
