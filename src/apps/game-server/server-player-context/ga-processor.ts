import { ServiceResolver } from "../../../common/dependency/service.ts";
import { mePlayerMoveGADef, provideMePlayerMoveGAHandler } from "../../../actions/player-move/me-player-move-ga.ts";
import { pangGADef, providePangGAHandler } from "../../../actions/stats/pang-ga.ts";
import { pingGADef, providePingGAHandler } from "../../../actions/stats/ping-ga.ts";
import { pongGADef } from "../../../actions/stats/pong-ga.ts";
import { UniversalGAProcessor } from "../../../common/action/processor.ts";
import { loginRequestGADef, provideLoginRequestGAHandler } from "../../../actions/login/login-request-ga.ts";
import { loginResponseGADef } from "../../../actions/login/login-response-ga.ts";
import { meRequestGADef, provideMeRequestGAHandler } from "../../../actions/me/me-request-ga.ts";
import { meResponseGADef } from "../../../actions/me/me-response-ga.ts";

export function feedServerGAProcessor(resolver: ServiceResolver, processor: UniversalGAProcessor) {
  processor.registerHandler(loginRequestGADef, loginResponseGADef, resolver.resolve(provideLoginRequestGAHandler));
  processor.registerHandler(pingGADef, pongGADef, resolver.resolve(providePingGAHandler));
  processor.registerHandler(pangGADef, undefined, resolver.resolve(providePangGAHandler));
  processor.registerHandler(meRequestGADef, meResponseGADef, resolver.resolve(provideMeRequestGAHandler));
  processor.registerHandler(mePlayerMoveGADef, undefined, resolver.resolve(provideMePlayerMoveGAHandler));
}
