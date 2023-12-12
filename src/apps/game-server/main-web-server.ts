import { ServiceResolver } from "../../common/dependency/service.ts";
import { Router } from "../../common/web/router.ts";
import { WebServer } from "../../common/web/server.ts";
import { loginEPRoute, provideLoginEPHandler } from "../../actions/login/login-ep.ts";
import { helloEPRoute, provideHelloEPHandler } from "../../actions/hello/hello-ep.ts";
import { clientChannelEPRoute, provideClientChannelEP } from "../../actions/client-channel/client-channel-ep.ts";
import { clientWebSocketEPRoute, provideClientWebSocketEP } from "../../actions/client-web-socket/client-web-socket-ep.ts";
import { MethodOptionsEP, methodOptionsEPRoute } from "../../actions/method-options/method-options.ts";
import { GlobalMiddleware } from "../../common/web/global-middleware.ts";
import { BasicLogger } from "../../common/logger/basic-logger.ts";
import { provideMainLogBus } from "../../common/logger/log-bus.ts";

export function provideMainWebServerConfig() {
  return {
    hostname: "0.0.0.0",
    name: "main",
    port: 3088,
  };
}

export function provideMainWebRouter(resolver: ServiceResolver) {
  const router = new Router();
  router.add(helloEPRoute, resolver.resolve(provideHelloEPHandler));
  router.add(loginEPRoute, resolver.resolve(provideLoginEPHandler));
  router.add(clientChannelEPRoute, resolver.resolve(provideClientChannelEP));
  router.add(clientWebSocketEPRoute, resolver.resolve(provideClientWebSocketEP));
  router.add(methodOptionsEPRoute, new MethodOptionsEP());
  return router;
}

export function provideWebServer(resolver: ServiceResolver) {
  const config = resolver.resolve(provideMainWebServerConfig);
  const globalMiddleware = new GlobalMiddleware(
    resolver.resolve(provideMainWebRouter),
  );
  const logger = new BasicLogger(
    "WEB",
    resolver.resolve(provideMainLogBus),
    config,
  );
  return new WebServer(
    config,
    globalMiddleware,
    logger
  );
}
