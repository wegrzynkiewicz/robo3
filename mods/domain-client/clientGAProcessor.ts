import { UniversalGAProcessor } from "../core/action/processor.ts";
import { gaSenderService } from "../core/action/sender.ts";
import { registerService, ServiceResolver } from "../dependency/service.ts";
import { chunkSegmentUpdateGADef } from "../domain/chunk/chunkSegmentUpdateGA.ts";
import { chunksUpdateGADef } from "../domain/chunk/chunksUpdateGA.ts";
import { pangGADef } from "../domain/stats/pangGA.ts";
import { pongGADef } from "../domain/stats/pongGA.ts";
import { chunkSegmentUpdateGAHandlerService } from "./chunk/chunkSegmentUpdateGAHandler.ts";
import { chunksUpdateGAHandlerService } from "./chunk/chunksUpdateGAHandler.ts";
import { beingUpdateGADef } from "./player-move/beingUpdate.ts";
import { beingUpdateGAHandlerService } from "./player-move/BeingUpdateGAHandler.ts";
import { pongGAHandlerService } from "./stats/pongGAHandler.ts";

export const clientGAProcessor = registerService({
  name: "clientGAProcessor",
  async provider(resolver: ServiceResolver) {
    const sender = resolver.resolve(provideGaSender);
    const processor = new UniversalGAProcessor(sender);
    processor.registerHandler(chunksUpdateGADef, undefined, resolver.resolve(provideChunksUpdateGAHandler));
    processor.registerHandler(chunkSegmentUpdateGADef, undefined, resolver.resolve(provideChunkSegmentUpdateGAHandler));
    processor.registerHandler(pongGADef, pangGADef, resolver.resolve(providePongGAHandler));
    processor.registerHandler(beingUpdateGADef, undefined, resolver.resolve(provideBeingUpdateGAHandler));
    return processor;
  },
});
