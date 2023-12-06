import { GAProcessor, UniversalGAProcessor } from "../core/action/processor.ts";
import { gaSenderService } from "../core/action/sender.ts";
import { registerService, ServiceResolver } from "../dependency/service.ts";
import { mePlayerMoveGADef } from "../domain-client/player-move/move.ts";
import { loginGARequestDef, loginGAResponseDef } from "../domain/loginGA.ts";
import { pangGADef } from "../domain/stats/pangGA.ts";
import { pingGADef } from "../domain/stats/pingGA.ts";
import { pongGADef } from "../domain/stats/pongGA.ts";
import { loginGARequestHandlerService } from "./loginGAHandler.ts";
import { mePlayerMoveGAHandlerService } from "./player-move/MePlayerMoveGAHandler.ts";
import { pangGAHandlerService } from "./stats/pangGAHandler.ts";
import { pingGAHandlerService } from "./stats/pingGAHandler.ts";

export const serverGAProcessor = registerService({
  name: "serverGAProcessor",
  provider: async (resolver: ServiceResolver): Promise<GAProcessor> => {
    const processor = new UniversalGAProcessor(
      resolver.resolve(provideGaSender),
    );
    processor.registerHandler(loginGARequestDef, loginGAResponseDef, resolver.resolve(provideLoginGARequestHandler));
    processor.registerHandler(pingGADef, pongGADef, resolver.resolve(providePingGAHandler));
    processor.registerHandler(pangGADef, undefined, resolver.resolve(providePangGAHandler));
    processor.registerHandler(mePlayerMoveGADef, undefined, resolver.resolve(provideMePlayerMoveGAHandler));
    return processor;
  },
});
