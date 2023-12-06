import { BeingManager } from "../../domain-server/BeingManager.ts";

export class Space {
  public readonly beingManager = new BeingManager();
}
