import { assertRequiredString } from "../common/asserts.ts";
import { GARequestHandler } from "../core/action/processor.ts";
import { registerService } from "../core/dependency/service.ts";
import { LoginGARequest, LoginGAResponse } from "../domain/loginGA.ts";

async function provider() {
  const loginGAHandler: GARequestHandler<LoginGARequest, LoginGAResponse> = {
    async handle(request: LoginGARequest): Promise<LoginGAResponse> {
      const { token } = request;
      assertRequiredString(token, "token-should-be-valid-non-empty-string", { request });
      return { status: 1 };
    },
  };
  return loginGAHandler;
}

export const loginGAHandler = registerService({ provider });
