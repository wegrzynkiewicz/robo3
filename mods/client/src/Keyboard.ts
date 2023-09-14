import { registerService } from "../../core/dependency/service.ts";

export class Keyboard {
  public readonly states: Record<string, boolean> = {};

  public keyDown(event: KeyboardEvent): void {
    this.states[event.code] = true;
  }

  public keyUp(event: KeyboardEvent): void {
    this.states[event.code] = false;
  }
}

export const keyboardService = registerService({
  async provider(): Promise<Keyboard> {
    return new Keyboard();
  },
});
