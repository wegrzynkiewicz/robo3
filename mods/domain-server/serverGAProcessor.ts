import { UniversalGAProcessor } from "../core/action/processor.ts";
import { provideGASender } from "../core/action/sender.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { mePlayerMoveGADef } from "../domain-client/player-move/move.ts";
import { loginGARequestDef, loginGAResponseDef } from "../domain/loginGA.ts";
import { pangGADef } from "../domain/stats/pangGA.ts";
import { pingGADef } from "../domain/stats/pingGA.ts";
import { pongGADef } from "../domain/stats/pongGA.ts";
import { provideLoginGARequestHandler } from "./loginGAHandler.ts";
import { provideMePlayerMoveGAHandler } from "./player-move/MePlayerMoveGAHandler.ts";
import { providePangGAHandler } from "./stats/pangGAHandler.ts";
import { providePingGAHandler } from "./stats/pingGAHandler.ts";

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
