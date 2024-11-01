import { provideDBClient } from "../../apps/game-server/db.ts";
import { MongoClient } from "../../apps/game-server/deps.ts";
import { ChunkId } from "../../common/chunk/chunk-id.ts";
import { ChunkSegment } from "../../common/chunk/chunk-segment.ts";
import { provideCADispatcher } from "../../common/communication/action/dispatcher.ts";
import { provideServerPlayerContextManager } from "../../common/communication/context/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { GameSimulationContextManager, provideGameSimulationContextManager } from "../../common/game/context/manager.ts";
import { ChunkDoc } from "../../common/storage/chunk.ts";
import { assertObject, assertRequiredString } from "../../common/utils/asserts.ts";
import { decompress } from "../../common/utils/binary.ts";
import { EPContext, EPHandler, EPRoute } from "../../common/web/endpoint.ts";
import { chunkSegmentUpdateCADef } from "../../domain/chunk/chunk-segment-update-ga.ts";

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
    protected readonly client: MongoClient,
  ) {}

  public async handle({ params, request }: EPContext): Promise<Response> {
    const { token } = parsePlayerWebSocketEPRequest(params);
    const spaceId = 1; // TODO: from token; 
    const { response, socket } = Deno.upgradeWebSocket(request);
    const gameSimulatorContext = this.manager.bySpaceId.get(spaceId);
    assertObject(gameSimulatorContext, "game-simulator-context-not-found");
    const playerContextManager = gameSimulatorContext.resolver.resolve(provideServerPlayerContextManager);
    const context = await playerContextManager.createServerPlayerContext({ socket });
    const dispatcher = context.resolver.resolve(provideCADispatcher);

    socket.addEventListener("open", async () => {
      const db = this.client.db("app");
      const collection = db.collection("chunks");

      const data = await collection.find().toArray();
      const dx = data as unknown as ChunkDoc[];

      const bf: { chunkId: ChunkId; segment: ChunkSegment }[] = [];
      for (const c of dx) {
        const decompressed = await decompress(c.data.buffer);
        const segment = ChunkSegment.createFromBuffer(decompressed, 0);
        bf.push({
          chunkId: ChunkId.fromHex(c._id.toString("hex")),
          segment,
        });
      }

      const chunkSize = 50;
      let j = 0;
      for (let i = 0; i < bf.length; i += chunkSize) {
        const chunks = bf.slice(i, i + chunkSize);
        setTimeout(() => {
          for (const c of chunks) {
            dispatcher.send(chunkSegmentUpdateCADef, c);
          }
        }, 50 * (j++));
      }
    });


    return response;
  }
}

export function providePlayerWebSocketEP(resolver: ServiceResolver) {
  return new PlayerWebSocketEP(
    resolver.resolve(provideGameSimulationContextManager),
    resolver.resolve(provideDBClient),
  );
}
