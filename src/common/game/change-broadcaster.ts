import { BeingUpdate, beingsUpdateCADef } from "../../actions/beings-update/beings-update-ca.ts";
import { Being } from "../being/manager.ts";
import { provideScopedUpdatedBeingList } from "../being/update-list.ts";
import { provideScopedCADispatcher } from "../communication/action/dispatcher.ts";
import { ServerPlayerContextManager, provideScopedServerPlayerContextManager } from "../communication/context/manager.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { Looper } from "./looper.ts";

export class GameChangeBroadCaster implements Looper {
  public constructor(
    protected readonly manager: ServerPlayerContextManager,
    protected readonly updatedBeingList: Set<Being>,
  ) { }

  public *prepareBeingsUpdate(): Generator<BeingUpdate, void, unknown> {
    for (const being of this.updatedBeingList.values()) {
      const beingUpdate: BeingUpdate = {
        beingId: being.id,
        direct: being.direct,
        x: being.x,
        y: being.y,
        z: being.z,
      };
      yield beingUpdate;
    }
    // this.updatedBeingList.clear();
  }

  public loop(): void {
    const beings = [...this.prepareBeingsUpdate()];
    if (beings.length === 0) {
      return;
    }
    for (const context of this.manager.byPlayerContextId.values()) {
      const dispatcher = context.resolver.resolve(provideScopedCADispatcher);
      dispatcher.send(beingsUpdateCADef, { beings });
    }
  }
}

export function provideGameChangeBroadCaster(resolver: ServiceResolver) {
  return new GameChangeBroadCaster(
    resolver.resolve(provideScopedServerPlayerContextManager),
    resolver.resolve(provideScopedUpdatedBeingList),
  );
}
