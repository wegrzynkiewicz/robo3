import { defineSimpleGameObjectType } from "../defining.ts";

import "./usable/door.ts";

defineSimpleGameObjectType({ gotKey: "core/floor/grass.sgo", spriteKey: "core/floor/grass.spr" });
defineSimpleGameObjectType({ gotKey: "core/floor/dirt.sgo", spriteKey: "core/floor/dirt.spr" });
