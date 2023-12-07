import { BeingManager } from "../../domain-server/being-manager.ts";

export class Space {
  public readonly beingManager = new BeingManager();
}
