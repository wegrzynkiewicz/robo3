import { EPHandler } from "../../web/endpoint.ts";

export interface LoginEPRequest {
  username: string;
  password: string;
}

export interface LoginEPResponse {
  token: string;
}

export class LoginEPHandler implements EPHandler {
  public async handle(req: Request): Promise<Response> {
    const payload = { token: "1234567890" };
    return Response.json(payload);
  }
}

export function provideLoginEPHandler() {
  return new LoginEPHandler();
}
