import { provideGlobalLogger } from "../../common/logger/global.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { Router } from "../../common/web/router.ts";
import { WebServer } from "../../common/web/server.ts";
import { loginEPRoute, provideLoginEPHandler } from "../../actions/login/login-ep.ts";
import { helloEPRoute, provideHelloEPHandler } from "../../actions/hello/hello-ep.ts";

export function provideMainWebServerConfig() {
  return {
    hostname: "0.0.0.0",
    name: "main",
    port: 8080,
  };
}

export function provideMainWebRouter(resolver: ServiceResolver) {
  const router = new Router();
  router.add(helloEPRoute, resolver.resolve(provideHelloEPHandler));
  router.add(loginEPRoute, resolver.resolve(provideLoginEPHandler));
  return router;
}

export function provideWebServer(resolver: ServiceResolver) {
  return new WebServer(
    resolver.resolve(provideMainWebServerConfig),
    resolver.resolve(provideMainWebRouter),
    resolver.resolve(provideGlobalLogger),
  );
}
