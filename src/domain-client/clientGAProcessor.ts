import { UniversalGAProcessor } from "../common/action/processor.ts";
import { provideGASender } from "../common/action/sender.ts";
import { ServiceResolver } from "../common/dependency/service.ts";
import { chunkSegmentUpdateGADef } from "../domain/chunk/chunkSegmentUpdateGA.ts";
import { chunksUpdateGADef } from "../domain/chunk/chunksUpdateGA.ts";
import { pangGADef } from "../actions/stats/pangGA.ts";
import { pongGADef } from "../actions/stats/pongGA.ts";
import { provideChunkSegmentUpdateGAHandler } from "./chunk/chunkSegmentUpdateGAHandler.ts";
import { provideChunksUpdateGAHandler } from "./chunk/chunksUpdateGAHandler.ts";
import { provideBeingUpdateGAHandler } from "../actions/being-update/BeingUpdateGAHandler.ts";
import { beingUpdateGADef } from "../actions/being-update/beingUpdateGA.ts";
import { providePongGAHandler } from "../actions/stats/pongGAHandler.ts";

export function provideClientGAProcessor(resolver: ServiceResolver) {
  const sender = resolver.resolve(provideGASender);
  const processor = new UniversalGAProcessor(sender);
  processor.registerHandler(chunksUpdateGADef, undefined, resolver.resolve(provideChunksUpdateGAHandler));
  processor.registerHandler(chunkSegmentUpdateGADef, undefined, resolver.resolve(provideChunkSegmentUpdateGAHandler));
  processor.registerHandler(pongGADef, pangGADef, resolver.resolve(providePongGAHandler));
  processor.registerHandler(beingUpdateGADef, undefined, resolver.resolve(provideBeingUpdateGAHandler));
  return processor;
}
