import { assertRequiredString, throws } from "../../common/asserts.ts";
import { GameObjectType } from "./foundation.ts";

export class GameObjectTEncodingTable {
  protected nextIndex = 256;
  public readonly gotByKey = new Map<string, GameObjectType>();
  public readonly gotByIndex: GameObjectType[] = [];

  public set(index: number, got: GameObjectType): void {
    const { gotKey } = got;
    assertRequiredString(got.gotKey, "got-without-key", { got });
    const existingByKey = this.gotByKey.get(gotKey);
    if (existingByKey !== undefined) {
      throws("got-with-key-already-exists", {
        key: gotKey,
        got,
        existingByKey,
      });
    }
    const existingByIndex = this.gotByIndex[index];
    if (existingByIndex !== undefined) {
      throws("got-with-index-already-exists", { index, got, existingByIndex });
    }
    this.gotByIndex[index] = got;
    this.gotByKey.set(gotKey, got);
  }

  public push(got: GameObjectType): number {
    const index = this.nextIndex++;
    this.set(index, got);
    return index;
  }
}
