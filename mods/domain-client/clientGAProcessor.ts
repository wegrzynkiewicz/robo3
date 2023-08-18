import { UniversalGAProcessor } from "../core/action/processor.ts";
import { gaSenderService } from "../core/action/sender.ts";
import { ServiceResolver, registerService } from "../core/dependency/service.ts";
import { chunksUpdateGADef } from "../domain/chunk/chunksUpdateGA.ts";
import { chunksUpdateGAHandlerService } from "./chunk/chunksUpdateGAHandler.ts";

export const clientGAProcessor = registerService({
  async provider(resolver: ServiceResolver) {
    const sender = await resolver.resolve(gaSenderService);
    const processor = new UniversalGAProcessor(sender);
    processor.registerHandler(chunksUpdateGADef, undefined, await resolver.resolve(chunksUpdateGAHandlerService));
    return processor;
  },
});
