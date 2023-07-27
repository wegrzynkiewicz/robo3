import { assertRequiredString } from "../../../../common/asserts.ts";
import { registerService } from "../../../dependency/service.ts";
import { GameActionRequest } from "../../foundation.ts";
import { GameActionRequestHandler } from "../../processor.ts";

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
