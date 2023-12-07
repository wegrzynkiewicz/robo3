import { KeyState } from "./key-short-cut.ts";
import { AnyKADefinition } from "./foundation.ts";

export class Keyboard {
  public static readonly IGNORE_CODES = [
    "AltLeft",
    "AltRight",
    "ControlLeft",
    "ControlRight",
    "ShiftLeft",
    "ShiftRight",
  ];
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

  public cloneSequence(): KeyState[] {
    return [...this.sequence];
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
    if (Keyboard.IGNORE_CODES.includes(event.code)) {
      return;
    }
    const keyState = new KeyState(
      event.code,
      event.altKey || states["AltRight"] || false,
      event.ctrlKey || states["ControlRight"] || false,
      event.shiftKey || states["ShiftRight"] || false,
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
    this.alt = false;
    this.ctrl = false;
    this.shift = false;
    this.states["AltRight"] = false;
    this.states["ControlRight"] = false;
    this.states["ShiftRight"] = false;
  }

  public isHold(kaDefinition: AnyKADefinition): boolean {
    for (const shortCut of kaDefinition.currentShortCuts) {
      if (shortCut.isHold(this)) {
        return true;
      }
    }
    return false;
  }
}

export function provideKeyboard() {
  return new Keyboard();
}
