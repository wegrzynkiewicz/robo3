import { UniversalGAProcessor } from "../common/action/processor.ts";
import { provideGASender } from "../common/action/sender.ts";
import { ServiceResolver } from "../common/dependency/service.ts";
import { chunkSegmentUpdateGADef } from "../domain/chunk/chunk-segment-update-ga.ts";
import { chunksUpdateGADef } from "../domain/chunk/chunks-update-ga.ts";
import { pangGADef } from "../actions/stats/pang-ga.ts";
import { pongGADef } from "../actions/stats/pong-ga.ts";
import { provideChunkSegmentUpdateGAHandler } from "./chunk/chunk-segment-update-ga-handler.ts";
import { provideChunksUpdateGAHandler } from "./chunk/chunks-update-ga-handler.ts";
import { provideBeingUpdateGAHandler } from "../actions/being-update/being-update-ga-handler.ts";
import { beingUpdateGADef } from "../actions/being-update/being-update-ga.ts";
import { providePongGAHandler } from "../actions/stats/pong-ga-handler.ts";

export function provideClientGAProcessor(resolver: ServiceResolver) {
  const sender = resolver.resolve(provideGASender);
  const processor = new UniversalGAProcessor(sender);
  processor.registerHandler(chunksUpdateGADef, undefined, resolver.resolve(provideChunksUpdateGAHandler));
  processor.registerHandler(chunkSegmentUpdateGADef, undefined, resolver.resolve(provideChunkSegmentUpdateGAHandler));
  processor.registerHandler(pongGADef, pangGADef, resolver.resolve(providePongGAHandler));
  processor.registerHandler(beingUpdateGADef, undefined, resolver.resolve(provideBeingUpdateGAHandler));
  return processor;
}
