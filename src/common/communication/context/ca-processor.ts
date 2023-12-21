import { ServiceResolver } from "../../dependency/service.ts";
import { mePlayerMoveCADef, provideMePlayerMoveCAHandler } from "../../../actions/player-move/me-player-move-ca.ts";
import { pangCADef, providePangCAHandler } from "../../../actions/stats/pang-ca.ts";
import { pingCADef, providePingCAHandler } from "../../../actions/stats/ping-ca.ts";
import { pongCADef } from "../../../actions/stats/pong-ca.ts";
import { UniversalCAProcessor } from "../action/processor.ts";
import { loginRequestCADef, provideLoginRequestCAHandler } from "../../../actions/login/login-request-ca.ts";
import { loginResponseCADef } from "../../../actions/login/login-response-ca.ts";
import { meRequestCADef, provideMeRequestCAHandler } from "../../../actions/me/me-request-ca.ts";
import { meResponseCADef } from "../../../actions/me/me-response-ca.ts";

export function feedServerCAProcessor(resolver: ServiceResolver, processor: UniversalCAProcessor) {
  processor.registerHandler(loginRequestCADef, loginResponseCADef, resolver.resolve(provideLoginRequestCAHandler));
  processor.registerHandler(pingCADef, pongCADef, resolver.resolve(providePingCAHandler));
  processor.registerHandler(pangCADef, undefined, resolver.resolve(providePangCAHandler));
  processor.registerHandler(meRequestCADef, meResponseCADef, resolver.resolve(provideMeRequestCAHandler));
  processor.registerHandler(mePlayerMoveCADef, undefined, resolver.resolve(provideMePlayerMoveCAHandler));
}
