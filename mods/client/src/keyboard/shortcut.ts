export interface KeyStateModifiers {
  readonly alt: boolean,
  readonly ctrl: boolean,
  readonly shift: boolean,
}

export class KeyState {
  public constructor(
    public readonly code: string,
    public readonly modifiers?: Partial<KeyStateModifiers>
  ) {

  }

  public match(event: KeyboardEvent): boolean {
    return true &&
      this.modifiers?.alt === event.altKey &&
      this.modifiers?.ctrl === event.ctrlKey &&
      this.modifiers?.shift === event.shiftKey &&
      this.code === event.code;
  }
}

export class KeyShortCut {
  public readonly sequence: KeyState[];
  public constructor(...sequence: KeyState[]) {
    this.sequence = sequence;
  }

  public static single(code: string, modifiers?: Partial<KeyStateModifiers>) {
    return new KeyShortCut(
      new KeyState(code, modifiers)
    );
  }
}
