import { GAHandler, UniversalGAProcessor } from "../core/action/processor.ts";
import { GASender } from "../core/action/sender.ts";
import { registerService } from "../core/dependency/service.ts";
import { LoginGARequest, LoginGAResponse, loginGARequestDef, loginGAResponseDef } from "../domain/loginGA.ts";
import { loginGARequestHandler } from "./loginGAHandler.ts";

export const serverGAProcessor = registerService({
  dependencies: {
    loginGARequestHandler,
  },
  globalKey: 'serverGAProcessor',
  provider: async (
    { loginGARequestHandler }: {
      loginGARequestHandler: GAHandler<LoginGARequest, LoginGAResponse>;
    },
    { sender }: {
      sender: GASender,
    }
  ) => {
    const processor = new UniversalGAProcessor(sender);
    processor.registerHandler(loginGARequestDef, loginGAResponseDef, loginGARequestHandler);
    return processor;
  },
});
