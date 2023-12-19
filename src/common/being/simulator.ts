import { BeingManager, provideScopedBeingManager } from "./manager.ts";
import { Looper } from "../simulator/looper.ts";
import { ServiceResolver } from "../dependency/service.ts";

export class BeingSimulator implements Looper {
  public constructor(
    protected readonly beingManager: BeingManager,
  ) {}
  
  public loop(deltaTime: number): void {
  }
}

export function provideScopedBeingSimulator(resolver: ServiceResolver) {
  return new BeingSimulator(
    resolver.resolve(provideScopedBeingManager),
  );
}
