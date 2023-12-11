import { ServiceResolver } from "../../../common/dependency/service.ts";
import { mePlayerMoveGADef, provideMePlayerMoveGAHandler } from "../../../actions/player-move/me-player-move-ga.ts";
import { loginGARequestDef, loginGAResponseDef } from "../../../actions/login/login-ga.ts";
import { pangGADef, providePangGAHandler } from "../../../actions/stats/pang-ga.ts";
import { pingGADef, providePingGAHandler } from "../../../actions/stats/ping-ga.ts";
import { pongGADef } from "../../../actions/stats/pong-ga.ts";
import { provideLoginGARequestHandler } from "../../../actions/login/login-ga-handler.ts";
import { UniversalGAProcessor } from "../../../common/action/processor.ts";

export function feedServerGAProcessor(resolver: ServiceResolver, processor: UniversalGAProcessor) {
  processor.registerHandler(loginGARequestDef, loginGAResponseDef, resolver.resolve(provideLoginGARequestHandler));
  processor.registerHandler(pingGADef, pongGADef, resolver.resolve(providePingGAHandler));
  processor.registerHandler(pangGADef, undefined, resolver.resolve(providePangGAHandler));
  processor.registerHandler(mePlayerMoveGADef, undefined, resolver.resolve(provideMePlayerMoveGAHandler));
}
