import { ServiceResolver } from "../../common/dependency/service.ts";
import { Router } from "../../common/web/router.ts";
import { WebServer } from "../../common/web/server.ts";
import { loginEPRoute, provideLoginEPHandler } from "../../actions/login/login-ep.ts";
import { helloEPRoute, provideHelloEPHandler } from "../../actions/hello/hello-ep.ts";
import { MethodOptionsEP, methodOptionsEPRoute } from "../../actions/method-options/method-options.ts";
import { GlobalMiddleware } from "../../common/web/global-middleware.ts";
import { BasicLogger } from "../../common/logger/basic-logger.ts";
import { provideMainLogBus } from "../../common/logger/log-bus.ts";
import { playerChannelEPRoute, providePlayerChannelEP } from "../../actions/player-channel/player-channel-ep.ts";
import { playerWebSocketEPRoute, providePlayerWebSocketEP } from "../../actions/player-web-socket/player-web-socket-ep.ts";

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
  router.add(playerChannelEPRoute, resolver.resolve(providePlayerChannelEP));
  router.add(playerWebSocketEPRoute, resolver.resolve(providePlayerWebSocketEP));
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
