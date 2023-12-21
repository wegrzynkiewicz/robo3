import { ServiceResolver } from "../../../common/dependency/service.ts";
import { mePlayerMoveCADef, provideMePlayerMoveCAHandler } from "../../../actions/player-move/me-player-move-ga.ts";
import { pangCADef, providePangCAHandler } from "../../../actions/stats/pang-ga.ts";
import { pingCADef, providePingCAHandler } from "../../../actions/stats/ping-ga.ts";
import { pongCADef } from "../../../actions/stats/pong-ga.ts";
import { UniversalCAProcessor } from "../../../common/action/processor.ts";
import { loginRequestCADef, provideLoginRequestCAHandler } from "../../../actions/login/login-request-ga.ts";
import { loginResponseCADef } from "../../../actions/login/login-response-ga.ts";
import { meRequestCADef, provideMeRequestCAHandler } from "../../../actions/me/me-request-ga.ts";
import { meResponseCADef } from "../../../actions/me/me-response-ga.ts";

export function feedServerCAProcessor(resolver: ServiceResolver, processor: UniversalCAProcessor) {
  processor.registerHandler(loginRequestCADef, loginResponseCADef, resolver.resolve(provideLoginRequestCAHandler));
  processor.registerHandler(pingCADef, pongCADef, resolver.resolve(providePingCAHandler));
  processor.registerHandler(pangCADef, undefined, resolver.resolve(providePangCAHandler));
  processor.registerHandler(meRequestCADef, meResponseCADef, resolver.resolve(provideMeRequestCAHandler));
  processor.registerHandler(mePlayerMoveCADef, undefined, resolver.resolve(provideMePlayerMoveCAHandler));
}
