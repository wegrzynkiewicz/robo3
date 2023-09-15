import { registerKADefinition } from "../keyboard/manager.ts";
import { KeyShortCut, KeyState } from "../keyboard/shortcut.ts";

const common = [
  new KeyState("AltRight"),
  new KeyState("KeyD"),
  new KeyState("KeyB"),
];

export const debugInfoOpenKA = registerKADefinition({
  name: 'debug.open-info',
  shortCuts: [
    new KeyShortCut(...common, new KeyState('KeyI')),
  ]
});
