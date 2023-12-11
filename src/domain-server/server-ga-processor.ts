import { UniversalGAProcessor } from "../common/action/processor.ts";
import { ServiceResolver } from "../common/dependency/service.ts";
import { mePlayerMoveGADef } from "../actions/player-move/me-player-move-ga.ts";
import { loginGARequestDef, loginGAResponseDef } from "../actions/login/login-ga.ts";
import { pangGADef } from "../actions/stats/pang-ga.ts";
import { pingGADef } from "../actions/stats/ping-ga.ts";
import { pongGADef } from "../actions/stats/pong-ga.ts";
import { provideLoginGARequestHandler } from "../actions/login/login-ga-handler.ts";
import { provideMePlayerMoveGAHandler } from "../actions/player-move/me-player-move-ga-handler.ts";
import { providePangGAHandler } from "../actions/stats/pang-ga-handler.ts";
import { providePingGAHandler } from "../actions/stats/ping-ga-handler.ts";
import { provideScopedGASender } from "../common/action/online-sender.ts";

export function provideServerGAProcessor(resolver: ServiceResolver) {
  const processor = new UniversalGAProcessor(
    resolver.resolve(provideScopedGASender),
  );
  processor.registerHandler(loginGARequestDef, loginGAResponseDef, resolver.resolve(provideLoginGARequestHandler));
  processor.registerHandler(pingGADef, pongGADef, resolver.resolve(providePingGAHandler));
  processor.registerHandler(pangGADef, undefined, resolver.resolve(providePangGAHandler));
  processor.registerHandler(mePlayerMoveGADef, undefined, resolver.resolve(provideMePlayerMoveGAHandler));
  return processor;
}
