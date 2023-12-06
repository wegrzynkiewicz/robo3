import { Breaker } from "../../common/breaker.ts";
import { globalLoggerService } from "../../core/logger.ts";
import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { Router } from "../router.ts";
import { WebServer, WebServerConfig } from "../server.ts";

export function provideWebServerConfig() {
  return {
    hostname: "0.0.0.0",
    name: "main",
    port: 8080,
  };
}

export function provideRouter() {
  throw new Breaker("main-web-router-must-be-injected");
}

export function provideWebServer(resolver: ServiceResolver) {
  return new WebServer(
    resolver.resolve(provideMainWebServerConfig),
    resolver.resolve(provideMainWebRouter),
    resolver.resolve(provideGlobalLogger),
  );
}
