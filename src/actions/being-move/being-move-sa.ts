import { BeingManager, provideScopedBeingManager } from "../../common/being/manager.ts";
import { ServiceResolver } from "../../common/dependency/service.ts";
import { SAHandler } from "../../common/simulator/actions/define.ts";
import { registerSADefinition } from "../../common/simulator/actions/sa-manager.ts";
import { MoveDirection } from "../player-move/me-player-move-ca.ts";

export interface BeingMoveSA {
  beingId: number;
  direction: MoveDirection;
}

export const beingMoveSA = registerSADefinition<BeingMoveSA>({
  kind: "being-move",
});

export class BeingMoveSAHandler implements SAHandler<BeingMoveSA>{
  public constructor(
    protected readonly beingManager: BeingManager,
  ) { }
  
  public async handle(action: BeingMoveSA): Promise<void> {
    const { beingId, direction } = action;
    const being = this.beingManager.byId.get(beingId);
    if (being === undefined) {
      return;
    }
    being.direct = direction;
  }
}

export function provideBeingMoveSAHandler(resolver: ServiceResolver) {
  return new BeingMoveSAHandler(
    resolver.resolve(provideScopedBeingManager),
  );
}
