import { registerGADefinition } from "../../common/action/manager.ts";

export interface LoginResponseGA {
  status: number;
}

export const loginResponseGADef = registerGADefinition<LoginResponseGA>({
  encoding: {
    type: "json",
  },
  key: 0x0005,
  kind: "login-res",
});

export class LoginResponseGAHandler {
  async handle(request: LoginResponseGA): Promise<void> {

  }
}

export function provideLoginResponseGAHandler() {
  return new LoginResponseGAHandler();
}
