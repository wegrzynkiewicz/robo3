import { Keyboard } from "./Keyboard.ts";

export class KeyState {
  public constructor(
    public readonly code: string,
    public readonly alt = false,
    public readonly ctrl = false,
    public readonly shift = false,
  ) { }

  public isHold(keyboard: Keyboard) {
    return true &&
      keyboard.alt === this.alt &&
      keyboard.ctrl === this.ctrl &&
      keyboard.shift === this.shift &&
      keyboard.states[this.code] === true;
  }

  public match(key: KeyState): boolean {
    return true &&
      this.alt === key.alt &&
      this.ctrl === key.ctrl &&
      this.shift === key.shift &&
      this.code === key.code;
  }
}

export class KeyShortCut {
  public readonly sequence: KeyState[];
  public constructor(...sequence: KeyState[]) {
    this.sequence = sequence;
  }

  public isHold(keyboard: Keyboard): boolean {
    const length = this.sequence.length;
    if (length === 0) {
      return false;
    }
    for (let i = this.sequence.length - 1; i >= 0; i--) {
      const keyState = this.sequence[i];
      if (keyState.isHold(keyboard) === false) {
        return false;
      }
    }
    return true;
  }

  public match(sequence: KeyState[]): boolean {
    if (sequence.length === 0) {
      return false;
    }
    if (sequence.length < this.sequence.length) {
      return false;
    }
    let index = sequence.length - 1;
    for (let i = this.sequence.length - 1; i >= 0; i--) {
      if (index < 0) {
        return false;
      }
      const keyState = this.sequence[i];
      const event = sequence[index];
      if (!keyState.match(event)) {
        return false;
      }
      index--;
    }
    return true;
  }
}
