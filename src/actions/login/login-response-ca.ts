import { registerCADefinition } from "../../common/communication/action/manager.ts";

export interface LoginResponseCA {
  status: number;
}

export const loginResponseCADef = registerCADefinition<LoginResponseCA>({
  encoding: {
    type: "json",
  },
  kind: "login-res",
});

export class LoginResponseCAHandler {
  async handle(request: LoginResponseCA): Promise<void> {

  }
}

export function provideLoginResponseCAHandler() {
  return new LoginResponseCAHandler();
}
