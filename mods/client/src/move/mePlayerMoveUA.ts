import { GASender, gaSenderService } from "../../../core/action/sender.ts";
import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { MoveDirection, mePlayerMoveGADef } from "../../../domain-client/player-move/move.ts";
import { UADefinition, registerUADefinition } from "../ua/foundation.ts";
import { UAHandler } from "../ua/processor.ts";

export const mePlayerMoveUA = registerUADefinition<MoveDirection>({
  name: "ua.me.player-move",
});

export class MePlayerMoveHandler implements UAHandler<number> {
  public constructor(
    protected gaSender: GASender,
  ) { }

  public async handle(_definition: UADefinition<MoveDirection>, data: MoveDirection): Promise<void> {
    // TODO: add GA mutation bus
    this.gaSender.send(mePlayerMoveGADef, { direction: data });
  }
}

export const mePlayerMoveUAHandlerService = registerService({
  name: "mePlayerMoveUAHandler",
  async provider(resolver: ServiceResolver): Promise<MePlayerMoveHandler> {
    return new MePlayerMoveHandler(
      await resolver.resolve(gaSenderService),
    );
  },
});
