import { ServerPlayerContext, provideScopedServerPlayerContext } from "../../apps/game-server/server-player-context/define.ts";
import { registerGADefinition } from "../../common/action/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { EmptyObject } from "../../common/utils/useful.ts";
import { MeResponseGA } from "./me-response-ga.ts";

export const meRequestGADef = registerGADefinition<EmptyObject>({
  encoding: {
    type: "json",
  },
  key: 0x00032,
  kind: "me-req",
});

export class MeRequestGAHandler {
  public constructor(
    private readonly context: ServerPlayerContext
  ) { }

  public async handle(): Promise<MeResponseGA> {
    const { beingId } = this.context;
    return { beingId };
  }
}

export function provideMeRequestGAHandler(resolver: ServiceResolver) {
  return new MeRequestGAHandler(
    resolver.resolve(provideScopedServerPlayerContext),
  );
}
