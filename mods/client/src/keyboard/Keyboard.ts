import { registerService } from "../../../core/dependency/service.ts";
import { KeyState } from "./KeyShortCut.ts";

export class Keyboard {
  public alt = false;
  public ctrl = false;
  public shift = false;
  public readonly states: Record<string, boolean> = {};
  public readonly sequence: KeyState[] = [];
  protected timerId = 0;
  protected readonly clearSequenceBound: () => void;

  public constructor() {
    this.clearSequenceBound = this.clearSequence.bind(this);
  }

  public keyDown(event: KeyboardEvent): void {
    const { clearSequenceBound, sequence, states } = this;
    states[event.code] = true;
    this.processModifiers(event);
    if (event.repeat) {
      return;
    }
    clearTimeout(this.timerId);
    this.timerId = setTimeout(clearSequenceBound, 1000);
    const keyState = new KeyState(
      event.code,
      states["AltLeft"] || states["AltRight"] || false,
      states["ControlLeft"] || states["ControlRight"] || false,
      states["ShiftLeft"] || states["ShiftRight"] || false,
    );
    sequence.push(keyState);
  }

  public keyUp(event: KeyboardEvent): void {
    this.states[event.code] = false;
    this.processModifiers(event);
  }

  public processModifiers(event: KeyboardEvent) {
    this.alt = event.altKey;
    this.ctrl = event.ctrlKey;
    this.shift = event.shiftKey;
  }

  public clearSequence(): void {
    this.sequence.splice(0);
  }
}

export const keyboardService = registerService({
  async provider(): Promise<Keyboard> {
    return new Keyboard();
  },
});
