import { provideGlobalLogger } from "../../common/logger/logger.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { Router } from "../../common/web/router.ts";
import { WebServer } from "../../common/web/server.ts";
import { provideLoginEPHandler } from "../../actions/login/login-ep.ts";
import { provideHelloEPHandler } from "../../actions/hello/hello-ep.ts";

export function provideMainWebServerConfig() {
  return {
    hostname: "0.0.0.0",
    name: "main",
    port: 8080,
  };
}

export function provideMainWebRouter(resolver: ServiceResolver) {
  const router = new Router();
  router.handlers.push(resolver.resolve(provideHelloEPHandler));
  router.handlers.push(resolver.resolve(provideLoginEPHandler));
  return router;
}

export function provideWebServer(resolver: ServiceResolver) {
  return new WebServer(
    resolver.resolve(provideMainWebServerConfig),
    resolver.resolve(provideMainWebRouter),
    resolver.resolve(provideGlobalLogger),
  );
}
