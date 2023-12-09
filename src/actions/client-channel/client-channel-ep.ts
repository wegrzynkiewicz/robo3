import { EPContext, EPHandler, EPRoute } from "../../common/web/endpoint.ts";

export interface ClientChannelEPResponse {
  wsURL: string;
}

export const clientChannelEPRoute = new EPRoute("POST", "/client-channel");

let i = 1;

export class ClientChannelEP implements EPHandler {
  public async handle({ request }: EPContext): Promise<Response> {
    const token = i++;
    const wsURL = new URL('ws://localhost:8080/ws');
    wsURL.pathname = `/client-web-socket/${token}`;
    const payload: ClientChannelEPResponse = {
      wsURL: wsURL.toString(),
    }
    return Response.json(payload);;
  }
}

export function provideClientChannelEP() {
  return new ClientChannelEP();
}
