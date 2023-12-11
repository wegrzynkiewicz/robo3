import { ServiceResolver } from "../../../common/dependency/service.ts";
import { GABus, provideMainGABus } from "../../../common/action/bus.ts";
import { registerUADefinition, UADefinition } from "../ua/foundation.ts";
import { UAHandler } from "../ua/processor.ts";
import { MoveDirection, mePlayerMoveGADef } from "../../../actions/player-move/me-player-move-ga.ts";

export const mePlayerMoveUA = registerUADefinition<MoveDirection>({
  name: "ua.me.player-move",
});

export class MePlayerMoveUAHandler implements UAHandler<number> {
  public constructor(
    protected gaBus: GABus,
  ) {}

  public async handle(_definition: UADefinition<MoveDirection>, data: MoveDirection): Promise<void> {
    // this.gaBus.dispatch(mePlayerMoveGADef, { direction: data });
  }
}

export function provideMePlayerMoveUAHandler(resolver: ServiceResolver) {
  return new MePlayerMoveUAHandler(
    resolver.resolve(provideMainGABus),
  );
}
