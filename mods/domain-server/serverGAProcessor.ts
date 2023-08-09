import { GAProcessor, GARequestHandler } from "../core/action/processor.ts";
import { registerService } from "../core/dependency/service.ts";
import { LoginGARequest, LoginGAResponse, loginGADef } from "../domain/loginGA.ts";
import { loginGAHandler } from "./loginGAHandler.ts";

export const serverGAProcessor = registerService({
  dependencies: {
    loginGAHandler,
  },
  provider: async (
    { loginGAHandler }: {
      loginGAHandler: GARequestHandler<LoginGARequest, LoginGAResponse>,
    }
  ) => {
    const processor = new GAProcessor();
    const { request } = processor;
    request.registerHandler(loginGADef, loginGAHandler)
    return processor;
  },
});
