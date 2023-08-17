import { assertRequiredString } from "../common/asserts.ts";
import { GAHandler } from "../core/action/processor.ts";
import { GASender } from "../core/action/sender.ts";
import { registerService } from "../core/dependency/service.ts";
import { LoginGARequest, loginGAResponseDef } from "../domain/loginGA.ts";

async function provider(
  _globalContext: any,
  { sender }: {
    sender: GASender,
  }
) {
  console.log(...arguments);
  const loginGARequestHandler: GAHandler<LoginGARequest> = {
    async handle(request: LoginGARequest): Promise<void> {
      const { id, token } = request;
      assertRequiredString(token, "token-should-be-valid-non-empty-string", { request });
      sender.send(loginGAResponseDef, { id, status: 1 })
    },
  };
  return loginGARequestHandler;
}

export const loginGARequestHandler = registerService({
  globalKey: 'loginGARequestHandler',
  provider,
});
