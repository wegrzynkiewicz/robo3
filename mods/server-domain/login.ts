import { assertRequiredString } from "../common/asserts.ts";
import { GameActionRequest } from "../core/action/foundation.ts";
import { GameActionRequestHandler } from "../core/action/processor.ts";
import { registerService } from "../core/dependency/service.ts";

async function provider() {
  const loginGAHandler: GameActionRequestHandler = {
    async handle(request: GameActionRequest): Promise<Record<string, unknown>> {
      const { token } = request.params;
      assertRequiredString(token, "token-should-be-valid-non-empty-string", { request });
      return { status: "valid" };
    },
  };
  return loginGAHandler;
}

export const loginGAHandler = registerService({ provider });
