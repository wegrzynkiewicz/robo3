import { GAHandler, UniversalGAProcessor } from "../core/action/processor.ts";
import { registerService } from "../core/dependency/service.ts";
import { LoginGARequest, loginGARequestDef } from "../domain/loginGA.ts";
import { loginGARequestHandler } from "./loginGAHandler.ts";

export const serverGAProcessor = registerService({
  dependencies: {
    loginGARequestHandler,
  },
  globalKey: 'serverGAProcessor',
  provider: async (
    { loginGARequestHandler }: {
      loginGARequestHandler: GAHandler<LoginGARequest>;
    },
  ) => {
    const processor = new UniversalGAProcessor();
    processor.registerHandler(loginGARequestDef, loginGARequestHandler);
    return processor;
  },
});
