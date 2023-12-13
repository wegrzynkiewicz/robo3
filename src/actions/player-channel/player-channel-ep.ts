import { EPContext, EPHandler, EPRoute } from "../../common/web/endpoint.ts";

export interface PlayerChannelEPResponse {
  wsURL: string;
}

export const playerChannelEPRoute = new EPRoute("POST", "/player-channel");

let i = 1;

export class PlayerChannelEP implements EPHandler {
  public async handle({ request }: EPContext): Promise<Response> {
    const token = i++;
    const wsURL = new URL('ws://localhost:3088/ws');
    wsURL.pathname = `/player-web-socket/${token}`;
    const payload: PlayerChannelEPResponse = {
      wsURL: wsURL.toString(),
    }
    return Response.json(payload);;
  }
}

export function providePlayerChannelEP() {
  return new PlayerChannelEP();
}
