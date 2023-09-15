import { registerService } from "../../../core/dependency/service.ts";
import { KeyShortCut } from "./shortcut.ts";

export class Keyboard {
  public readonly states: Record<string, boolean> = {};
  public readonly sequence: KeyboardEvent[] = [];
  protected timerId = 0;
  protected readonly clearSequenceBound: () => void;

  public constructor() {
    this.clearSequenceBound = this.clearSequence.bind(this);
  }

  public keyDown(event: KeyboardEvent): void {
    this.states[event.code] = true;
    clearTimeout(this.timerId);
    this.timerId = setTimeout(this.clearSequenceBound, 1000);
    this.sequence.push(event);
  }

  public keyUp(event: KeyboardEvent): void {
    this.states[event.code] = false;
  }

  public match(shortcut: KeyShortCut): boolean {
    if (this.sequence.length === 0) {
      return false;
    }
    if (shortcut.sequence.length < this.sequence.length) {
      return false;
    }
    let index = length - 1;
    for (let i = shortcut.sequence.length - 1; i >= 0; i--) {
      const keyState = shortcut.sequence[i];
      const event = this.sequence[index];
      if (!keyState.match(event)) {
        return false;
      }
      index--;
    }
    return true;
  }

  protected clearSequence(): void {
    this.sequence.splice(0);
  }
}

export const keyboardService = registerService({
  async provider(): Promise<Keyboard> {
    return new Keyboard();
  },
});
