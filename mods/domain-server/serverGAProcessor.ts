import { GAProcessor, UniversalGAProcessor } from "../core/action/processor.ts";
import { gaSenderService } from "../core/action/sender.ts";
import { registerService, ServiceResolver } from "../core/dependency/service.ts";
import { loginGARequestDef, loginGAResponseDef } from "../domain/loginGA.ts";
import { loginGARequestHandlerService } from "./loginGAHandler.ts";

export const serverGAProcessor = registerService({
  provider: async (resolver: ServiceResolver): Promise<GAProcessor> => {
    const sender = await resolver.resolve(gaSenderService);
    const processor = new UniversalGAProcessor(sender);
    processor.registerHandler(loginGARequestDef, loginGAResponseDef, await resolver.resolve(loginGARequestHandlerService));
    return processor;
  },
});
