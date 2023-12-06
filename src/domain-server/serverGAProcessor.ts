import { UniversalGAProcessor } from "../common/action/processor.ts";
import { provideGASender } from "../common/action/sender.ts";
import { ServiceResolver } from "../common/dependency/service.ts";
import { mePlayerMoveGADef } from "../actions/player-move/move.ts";
import { loginGARequestDef, loginGAResponseDef } from "../actions/login/loginGA.ts";
import { pangGADef } from "../actions/stats/pangGA.ts";
import { pingGADef } from "../actions/stats/pingGA.ts";
import { pongGADef } from "../actions/stats/pongGA.ts";
import { provideLoginGARequestHandler } from "../actions/login/loginGAHandler.ts";
import { provideMePlayerMoveGAHandler } from "../actions/player-move/MePlayerMoveGAHandler.ts";
import { providePangGAHandler } from "../actions/stats/pangGAHandler.ts";
import { providePingGAHandler } from "../actions/stats/pingGAHandler.ts";

export function provideServerGAProcessor(resolver: ServiceResolver) {
  const processor = new UniversalGAProcessor(
    resolver.resolve(provideGASender),
  );
  processor.registerHandler(loginGARequestDef, loginGAResponseDef, resolver.resolve(provideLoginGARequestHandler));
  processor.registerHandler(pingGADef, pongGADef, resolver.resolve(providePingGAHandler));
  processor.registerHandler(pangGADef, undefined, resolver.resolve(providePangGAHandler));
  processor.registerHandler(mePlayerMoveGADef, undefined, resolver.resolve(provideMePlayerMoveGAHandler));
  return processor;
}
