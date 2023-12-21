import { registerCADefinition } from "../../common/action/manager.ts";
import { assertRequiredString } from "../../common/utils/asserts.ts";
import { LoginResponseCA } from "./login-response-ca.ts";

export interface LoginRequestCA {
  token: string;
}

export const loginRequestCADef = registerCADefinition<LoginRequestCA>({
  encoding: {
    type: "json",
  },
  kind: "login-req",
});

export class LoginRequestCAHandler {
  async handle(request: LoginRequestCA): Promise<LoginResponseCA> {
    const { token } = request;
    assertRequiredString(token, "token-should-be-valid-non-empty-string", { request });
    return { status: 1 };
  }
}

export function provideLoginRequestCAHandler() {
  return new LoginRequestCAHandler();
}
