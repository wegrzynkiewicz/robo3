import { UniversalGAProcessor } from "../../../common/action/processor.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { chunkSegmentUpdateGADef } from "../../../domain/chunk/chunk-segment-update-ga.ts";
import { chunksUpdateGADef } from "../../../domain/chunk/chunks-update-ga.ts";
import { pangGADef } from "../../../actions/stats/pang-ga.ts";
import { pongGADef, providePongGAHandler } from "../../../actions/stats/pong-ga.ts";
import { provideChunkSegmentUpdateGAHandler } from "../../../domain-client/chunk/chunk-segment-update-ga-handler.ts";
import { provideChunksUpdateGAHandler } from "../../../domain-client/chunk/chunks-update-ga-handler.ts";
import { beingUpdateGADef, provideBeingUpdateGAHandler } from "../../../actions/being-update/being-update-ga.ts";
import { meResponseGADef, provideMeResponseGAHandler } from "../../../actions/me/me-response-ga.ts";

export function feedClientSideGAProcess(resolver: ServiceResolver, processor: UniversalGAProcessor) {
  processor.registerHandler(chunksUpdateGADef, undefined, resolver.resolve(provideChunksUpdateGAHandler));
  processor.registerHandler(chunkSegmentUpdateGADef, undefined, resolver.resolve(provideChunkSegmentUpdateGAHandler));
  processor.registerHandler(pongGADef, pangGADef, resolver.resolve(providePongGAHandler));
  processor.registerHandler(beingUpdateGADef, undefined, resolver.resolve(provideBeingUpdateGAHandler));
  processor.registerHandler(meResponseGADef, undefined, resolver.resolve(provideMeResponseGAHandler));
}
