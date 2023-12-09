import { assertObject, assertRequiredString } from "../../common/utils/asserts.ts";
import { EPContext, EPHandler, EPRoute } from "../../common/web/endpoint.ts";

export interface ClientWebSocketEPParams {
  token: string;
}

export function parseClientWebSocketEPRequest(value: unknown): ClientWebSocketEPParams {
  assertObject<ClientWebSocketEPParams>(value, "client-web-socket-params-must-be-object");
  const { token } = value;
  assertRequiredString(token, "client-web-socket-params-token-must-be-string");
  return { token };
}

export const clientWebSocketEPRoute = new EPRoute("GET", "/client-web-socket/:token");

export class ClientWebSocketEP implements EPHandler {
  public async handle({ params, request }: EPContext): Promise<Response> {
    const { token } = parseClientWebSocketEPRequest(params);
    const {response, socket} = Deno.upgradeWebSocket(request);
    return response;
  }
}

export function provideClientWebSocketEP() {
  return new ClientWebSocketEP();
}
