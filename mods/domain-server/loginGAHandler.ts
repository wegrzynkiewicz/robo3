import { assertRequiredString } from "../utils/asserts.ts";
import { GAHandler } from "../common/action/processor.ts";

import { LoginGARequest, LoginGAResponse } from "../domain/loginGA.ts";

export function provideLoginGARequestHandler() {
  const loginGARequestHandler: GAHandler<LoginGARequest, LoginGAResponse> = {
    async handle(request: LoginGARequest): Promise<LoginGAResponse> {
      const { token } = request;
      assertRequiredString(token, "token-should-be-valid-non-empty-string", { request });
      return { status: 1 };
    },
  };
  return loginGARequestHandler;
}
