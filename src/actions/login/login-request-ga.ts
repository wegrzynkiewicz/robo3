import { registerGADefinition } from "../../common/action/manager.ts";
import { assertRequiredString } from "../../common/utils/asserts.ts";
import { LoginResponseGA } from "./login-response-ga.ts";

export interface LoginRequestGA {
  token: string;
}

export const loginRequestGADef = registerGADefinition<LoginRequestGA>({
  encoding: {
    type: "json",
  },
  key: 0x0004,
  kind: "login-req",
});

export class LoginRequestGAHandler {
  async handle(request: LoginRequestGA): Promise<LoginResponseGA> {
    const { token } = request;
    assertRequiredString(token, "token-should-be-valid-non-empty-string", { request });
    return { status: 1 };
  }
}

export function provideLoginRequestGAHandler() {
  return new LoginRequestGAHandler();
}
