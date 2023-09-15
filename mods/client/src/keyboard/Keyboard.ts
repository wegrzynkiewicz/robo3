import { registerService } from "../../../core/dependency/service.ts";

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

  public clearSequence(): void {
    this.sequence.splice(0);
  }
}

export const keyboardService = registerService({
  async provider(): Promise<Keyboard> {
    return new Keyboard();
  },
});
