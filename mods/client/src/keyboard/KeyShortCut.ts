import { Keyboard } from "./Keyboard.ts";

export class KeyState {
  public constructor(
    public readonly code: string,
    public readonly altKey = false,
    public readonly ctrlKey = false,
    public readonly shiftKey = false,
  ) {

  }

  public match(event: KeyboardEvent): boolean {
    return true &&
      this.altKey === event.altKey &&
      this.ctrlKey === event.ctrlKey &&
      this.shiftKey === event.shiftKey &&
      this.code === event.code;
  }
}

export class KeyShortCut {

  public static readonly IGNORE_CODES = [
    'AltLeft',
    'AltRight',
    'ControlLeft',
    'ControlRight',
    'ShiftLeft',
    'ShiftRight',
  ];

  public readonly sequence: KeyState[];
  public constructor(...sequence: KeyState[]) {
    this.sequence = sequence;
  }

  public match(keyboard: Keyboard): boolean {
    const length = keyboard.sequence.length;
    if (length === 0) {
      return false;
    }
    if (this.sequence.length < length) {
      return false;
    }
    let index = length - 1;
    for (let i = this.sequence.length - 1; i >= 0; i--) {
      const keyState = this.sequence[i];
      if (index < 0) {
        return false;
      }
      const event = keyboard.sequence[index];
      if (!keyState.match(event)) {
        if (!KeyShortCut.IGNORE_CODES.includes(event.code)) {
          return false;
        }
      }
      index--;
    }
    keyboard.clearSequence();
    return true;
  }
}
