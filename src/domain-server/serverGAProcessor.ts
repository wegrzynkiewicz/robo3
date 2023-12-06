import { UniversalGAProcessor } from "../common/action/processor.ts";
import { provideGASender } from "../common/action/sender.ts";
import { ServiceResolver } from "../common/dependency/service.ts";
import { mePlayerMoveGADef } from "../features/player-move/move.ts";
import { loginGARequestDef, loginGAResponseDef } from "../features/login/loginGA.ts";
import { pangGADef } from "../domain/stats/pangGA.ts";
import { pingGADef } from "../domain/stats/pingGA.ts";
import { pongGADef } from "../domain/stats/pongGA.ts";
import { provideLoginGARequestHandler } from "../features/login/loginGAHandler.ts";
import { provideMePlayerMoveGAHandler } from "../features/player-move/MePlayerMoveGAHandler.ts";
import { providePangGAHandler } from "../features/stats/pangGAHandler.ts";
import { providePingGAHandler } from "../features/stats/pingGAHandler.ts";

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
