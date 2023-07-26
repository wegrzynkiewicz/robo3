import { assertRequiredString } from "../../../common/asserts.ts";
import { GameActionRequest } from "../foundation.ts";
import { GameActionRequestHandler } from "../processor.ts";

export const loginGAHandler: GameActionRequestHandler = {
  async handle(
    scoped: unknown,
    request: GameActionRequest,
  ): Promise<Record<string, unknown>> {
    const { token } = request.params;
    assertRequiredString(token, "token-should-be-valid-non-empty-string", { request });
    return { status: "valid" };
  },
};
