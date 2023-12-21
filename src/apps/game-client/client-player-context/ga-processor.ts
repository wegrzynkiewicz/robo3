import { UniversalCAProcessor } from "../../../common/communication/action/processor.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { chunkSegmentUpdateCADef } from "../../../domain/chunk/chunk-segment-update-ga.ts";
import { chunksUpdateCADef } from "../../../domain/chunk/chunks-update-ga.ts";
import { pangCADef } from "../../../actions/stats/pang-ca.ts";
import { pongCADef, providePongCAHandler } from "../../../actions/stats/pong-ca.ts";
import { provideChunkSegmentUpdateCAHandler } from "../../../domain-client/chunk/chunk-segment-update-ga-handler.ts";
import { provideChunksUpdateCAHandler } from "../../../domain-client/chunk/chunks-update-ga-handler.ts";
import { beingUpdateCADef, provideBeingUpdateCAHandler } from "../../../actions/being-update/being-update-ca.ts";
import { meResponseCADef, provideMeResponseCAHandler } from "../../../actions/me/me-response-ca.ts";

export function feedClientSideCAProcess(resolver: ServiceResolver, processor: UniversalCAProcessor) {
  processor.registerHandler(chunksUpdateCADef, undefined, resolver.resolve(provideChunksUpdateCAHandler));
  processor.registerHandler(chunkSegmentUpdateCADef, undefined, resolver.resolve(provideChunkSegmentUpdateCAHandler));
  processor.registerHandler(pongCADef, pangCADef, resolver.resolve(providePongCAHandler));
  processor.registerHandler(beingUpdateCADef, undefined, resolver.resolve(provideBeingUpdateCAHandler));
  processor.registerHandler(meResponseCADef, undefined, resolver.resolve(provideMeResponseCAHandler));
}
