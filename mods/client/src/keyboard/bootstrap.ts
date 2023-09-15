import { ServiceResolver, registerService } from "../../../core/dependency/service.ts";
import { debugInfoOpenKA } from "../debug/shortcuts.ts";
import { KAProcessor, universalKAHandlerService } from "./action.ts";

export const kaProcessorService = registerService({
  async provider(resolve: ServiceResolver): Promise<KAProcessor> {
    const universalKAHandler = await resolve.resolve(universalKAHandlerService);
    const processor = new KAProcessor();
    processor.registerHandler(debugInfoOpenKA, universalKAHandler);
    return processor;
  },
});
