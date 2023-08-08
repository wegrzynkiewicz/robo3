import { registerService } from "../dependency/service.ts";
import { GameAction } from "./foundation.ts";

export interface GameActionCodec<TGameAction extends GameAction<unknown>> {
  calcBufferSize(params: TGameAction['params']): number;
  readonly code: TGameAction["code"];
  decode(buffer: ArrayBuffer, byteOffset: number): TGameAction['params'];
  encode(buffer: ArrayBuffer, byteOffset: number, params: TGameAction['params']): void;
}

export type UnknownGameActionCodec = GameActionCodec<GameAction<Record<string, unknown>>>;

export type UnknownGameActionCodecBinding = {
  codec: UnknownGameActionCodec;
  index: number;
}

export class GameActionCodecManager {
  protected currentIndex = 1;
  public readonly byIndex = new Map<number, UnknownGameActionCodecBinding>();
  public readonly byKey = new Map<string, UnknownGameActionCodecBinding>();

  public registerGameActionCodec(codec: UnknownGameActionCodec) {
    const index = this.currentIndex++;
    const binding: UnknownGameActionCodecBinding = { index, codec };
    this.byIndex.set(index, binding);
    this.byKey.set(codec.code, binding);
  }
}

const manager = new GameActionCodecManager();
export const registerGameActionCodec = manager.registerGameActionCodec.bind(manager);

export const gameActionCodecManager = registerService({
  provider: async () => (manager),
  singleton: true,
});
