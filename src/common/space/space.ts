import { Breaker } from "../utils/breaker.ts";

export class Space {
  public constructor(
    public readonly spaceId: number,
  ) { }
}

export function provideScopedSpace(): Space {
  throw new Breaker("space-must-be-injected");
}
