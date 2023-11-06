import { UniversalGAProcessor } from "../core/action/processor.ts";
import { gaSenderService } from "../core/action/sender.ts";
import { registerService, ServiceResolver } from "../dependency/service.ts";
import { chunkSegmentUpdateGADef } from "../domain/chunk/chunkSegmentUpdateGA.ts";
import { chunksUpdateGADef } from "../domain/chunk/chunksUpdateGA.ts";
import { chunkSegmentUpdateGAHandlerService } from "./chunk/chunkSegmentUpdateGAHandler.ts";
import { chunksUpdateGAHandlerService } from "./chunk/chunksUpdateGAHandler.ts";

export const clientGAProcessor = registerService({
  async provider(resolver: ServiceResolver) {
    const sender = await resolver.resolve(gaSenderService);
    const processor = new UniversalGAProcessor(sender);
    processor.registerHandler(chunksUpdateGADef, undefined, await resolver.resolve(chunksUpdateGAHandlerService));
    processor.registerHandler(chunkSegmentUpdateGADef, undefined, await resolver.resolve(chunkSegmentUpdateGAHandlerService));
    return processor;
  },
});
