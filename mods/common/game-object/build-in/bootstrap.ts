import { defineSimpleGameObjectType } from "../defining.ts";

import "./usable/door.ts";

function define(
  { key, x, y }: {
    key: string;
    x: number;
    y: number;
  },
) {
  const spriteKey = `${key}.spr`;
  defineSimpleGameObjectType({
    gotKey: `${key}.sgo`,
    spriteKey,
  });
}

define({ key: "core/floor/grass", x: 0, y: 0 });
define({ key: "core/floor/dirt", x: 6 * 32, y: 0 });
