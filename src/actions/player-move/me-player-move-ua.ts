import { ServiceResolver } from "../../common/dependency/service.ts";
import { registerUADefinition, UADefinition } from "../../apps/game-client/ua/foundation.ts";
import { UAHandler } from "../../apps/game-client/ua/processor.ts";
import { MoveDirection, mePlayerMoveGADef } from "./me-player-move-ga.ts";
import { GADispatcher } from "../../common/action/define.ts";
import { provideMainGADispatcher } from "../../common/action/dispatcher.ts";

export const mePlayerMoveUA = registerUADefinition<MoveDirection>({
  name: "ua.me.player-move",
});

export class MePlayerMoveUAHandler implements UAHandler<number> {
  public constructor(
    protected dispatcher: GADispatcher,
  ) {}

  public async handle(_definition: UADefinition<MoveDirection>, data: MoveDirection): Promise<void> {
    this.dispatcher.send(mePlayerMoveGADef, { direction: data });
  }
}

export function provideMePlayerMoveUAHandler(resolver: ServiceResolver) {
  return new MePlayerMoveUAHandler(
    resolver.resolve(provideMainGADispatcher),
  );
}
