import { registerGADefinition } from "../../common/action/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { MePlayer, provideMePlayer } from "./me-player.ts";

export interface MeResponseGA {
  beingId: number;
}

export const meResponseGADef = registerGADefinition<MeResponseGA>({
  encoding: {
    type: "json",
  },
  key: 0x00033,
  kind: "me-res",
});

export class MeResponseGAHandler {
  public constructor(
    private readonly mePlayer: MePlayer,
  ) { }
  
  public async handle(response: MeResponseGA): Promise<void> {
    this.mePlayer.beingId = response.beingId;
  }
}

export function provideMeResponseGAHandler(resolver: ServiceResolver) {
  return new MeResponseGAHandler(
    resolver.resolve(provideMePlayer),
  );
}
