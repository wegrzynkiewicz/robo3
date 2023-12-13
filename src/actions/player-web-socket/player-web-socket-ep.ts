import { ServerPlayerContextManager, provideServerPlayerContextManager } from "../../apps/game-server/server-player-context/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { assertObject, assertRequiredString } from "../../common/utils/asserts.ts";
import { EPContext, EPHandler, EPRoute } from "../../common/web/endpoint.ts";

export interface PlayerWebSocketEPParams {
  token: string;
}

export function parsePlayerWebSocketEPRequest(value: unknown): PlayerWebSocketEPParams {
  assertObject<PlayerWebSocketEPParams>(value, "player-web-socket-params-must-be-object");
  const { token } = value;
  assertRequiredString(token, "player-web-socket-params-token-must-be-string");
  return { token };
}

export const playerWebSocketEPRoute = new EPRoute("GET", "/player-web-socket/:token");

export class PlayerWebSocketEP implements EPHandler {
  public constructor(
    public readonly manager: ServerPlayerContextManager,
  ) { }

  public async handle({ params, request }: EPContext): Promise<Response> {
    const { token } = parsePlayerWebSocketEPRequest(params);
    const { response, socket } = Deno.upgradeWebSocket(request);
    this.manager.createServerPlayerContext({ token, socket });
    return response;
  }
}

export function providePlayerWebSocketEP(resolver: ServiceResolver) {
  return new PlayerWebSocketEP(
    resolver.resolve(provideServerPlayerContextManager),
  );
}
