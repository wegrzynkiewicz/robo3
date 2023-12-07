import { assertObject, assertRequiredString } from "../../common/utils/asserts.ts";
import { EPContext, EPHandler, EPRoute } from "../../common/web/endpoint.ts";

export interface LoginEPRequest {
  username: string;
  password: string;
}

export interface LoginEPResponse {
  token: string;
}

export function parseLoginEPRequest(value: unknown): LoginEPRequest {
  assertObject<LoginEPRequest>(value, "login-request-must-be-object");
  const { username, password } = value;
  assertRequiredString(username, "login-request-username-must-be-string");
  assertRequiredString(password, "login-request-password-must-be-string");
  return { username, password };
}

export class LoginEPHandler implements EPHandler {
  public readonly route = new EPRoute("POST", "/login");
  public async handle({ request }: EPContext): Promise<Response> {
    const body = await request.json();
    const { username, password } = parseLoginEPRequest(body);
    const payload: LoginEPResponse = { token: `${username}:${password}` };
    return Response.json(payload);;
  }
}

export function provideLoginEPHandler() {
  return new LoginEPHandler();
}
