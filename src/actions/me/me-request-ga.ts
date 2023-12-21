import { ServerPlayerContext, provideScopedServerPlayerContext } from "../../apps/game-server/server-player-context/define.ts";
import { registerCADefinition } from "../../common/action/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { EmptyObject } from "../../common/utils/useful.ts";
import { MeResponseCA } from "./me-response-ga.ts";

export const meRequestCADef = registerCADefinition<EmptyObject>({
  encoding: {
    type: "json",
  },
  kind: "me-req",
});

export class MeRequestCAHandler {
  public constructor(
    private readonly context: ServerPlayerContext
  ) { }

  public async handle(): Promise<MeResponseCA> {
    const { beingId } = this.context;
    return { beingId };
  }
}

export function provideMeRequestCAHandler(resolver: ServiceResolver) {
  return new MeRequestCAHandler(
    resolver.resolve(provideScopedServerPlayerContext),
  );
}
