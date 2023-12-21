import { registerCADefinition } from "../../common/communication/action/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { MePlayer, provideMePlayer } from "./me-player.ts";

export interface MeResponseCA {
  beingId: number;
}

export const meResponseCADef = registerCADefinition<MeResponseCA>({
  encoding: {
    type: "json",
  },
  kind: "me-res",
});

export class MeResponseCAHandler {
  public constructor(
    private readonly mePlayer: MePlayer,
  ) { }
  
  public async handle(response: MeResponseCA): Promise<void> {
    this.mePlayer.beingId = response.beingId;
  }
}

export function provideMeResponseCAHandler(resolver: ServiceResolver) {
  return new MeResponseCAHandler(
    resolver.resolve(provideMePlayer),
  );
}
