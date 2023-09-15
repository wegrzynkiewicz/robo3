import { KeyState, KeyShortCut } from "../keyboard/KeyShortCut.ts";
import { registerKADefinition } from "../keyboard/foundation.ts";

const common = [
  new KeyState("AltRight"),
  new KeyState("KeyD"),
  new KeyState("KeyB"),
];

export const debugInfoOpenKA = registerKADefinition({
  name: 'debug.open-info',
  shortCuts: [
    new KeyShortCut(...common, new KeyState('KeyI')),
  ],
});
