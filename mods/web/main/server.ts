import { Breaker } from "../../common/breaker.ts";
import { globalLoggerService } from "../../core/logger.ts";
import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { Router } from "../router.ts";
import { WebServerConfig, WebServer } from "../server.ts";

export const mainWebServerConfigService = registerService({
  name: "mainWebServerConfig",
  async provider(): Promise<WebServerConfig> {
    return {
      hostname: "0.0.0.0",
      name: 'main',
      port: 8080,
    };
  },
});

export const mainWebRouterService = registerService({
  name: "mainWebRouter",
  async provider(): Promise<Router> {
    throw new Breaker('main-web-router-must-be-injected');
  },
});


export const mainWebServerService = registerService({
  name: "mainWebServer",
  async provider(resolver: ServiceResolver): Promise<WebServer> {
    return new WebServer(
      await resolver.resolve(mainWebServerConfigService),
      await resolver.resolve(mainWebRouterService),
      await resolver.resolve(globalLoggerService),
    );
  },
});
