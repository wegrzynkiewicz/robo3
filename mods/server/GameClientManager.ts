import { registerService } from "../dependency/service.ts";

export class GameClient {
  public constructor(
    public readonly clientId: number,
  ) { }
}

export class GameClientManager {
  public readonly byClientId = new Map<number, GameClient>();

  public createClient(): GameClient {
    const clientId = this.byClientId.size;
    const client = new GameClient(clientId);
    this.byClientId.set(client.clientId, client);
    return client;
  }
}

export const gameClientManagerService = registerService({
  name: "gameClientManager",
  async provider(): Promise<GameClientManager> {
    return new GameClientManager();
  },
});
