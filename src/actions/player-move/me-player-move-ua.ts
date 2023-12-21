import { ServiceResolver } from "../../common/dependency/service.ts";
import { registerUADefinition, UADefinition } from "../../apps/game-client/ua/foundation.ts";
import { UAHandler } from "../../apps/game-client/ua/processor.ts";
import { MoveDirection, mePlayerMoveCADef } from "./me-player-move-ca.ts";
import { CADispatcher } from "../../common/action/define.ts";
import { provideMainCADispatcher } from "../../common/action/dispatcher.ts";

export const mePlayerMoveUA = registerUADefinition<MoveDirection>({
  name: "ua.me.player-move",
});

export class MePlayerMoveUAHandler implements UAHandler<number> {
  public constructor(
    protected dispatcher: CADispatcher,
  ) {}

  public async handle(_definition: UADefinition<MoveDirection>, data: MoveDirection): Promise<void> {
    this.dispatcher.send(mePlayerMoveCADef, { direction: data });
  }
}

export function provideMePlayerMoveUAHandler(resolver: ServiceResolver) {
  return new MePlayerMoveUAHandler(
    resolver.resolve(provideMainCADispatcher),
  );
}
