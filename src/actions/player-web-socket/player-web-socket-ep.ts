import { provideServerPlayerContextManager } from "../../common/communication/context/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { GameSimulationContextManager, provideGameSimulationContextManager } from "../../common/game/context/manager.ts";
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
    protected readonly manager: GameSimulationContextManager,
  ) { }

  public async handle({ params, request }: EPContext): Promise<Response> {
    const { token } = parsePlayerWebSocketEPRequest(params);
    const spaceId = 1; // TODO: from token; 
    const { response, socket } = Deno.upgradeWebSocket(request);
    const gameSimulatorContext = this.manager.bySpaceId.get(spaceId);
    assertObject(gameSimulatorContext, "game-simulator-context-not-found");
    const playerContextManager = gameSimulatorContext.resolver.resolve(provideServerPlayerContextManager);
    playerContextManager.createServerPlayerContext({ socket });
    return response;
  }
}

export function providePlayerWebSocketEP(resolver: ServiceResolver) {
  return new PlayerWebSocketEP(
    resolver.resolve(provideGameSimulationContextManager),
  );
}
