import { registerGADefinition } from "../../common/action/manager.ts";

export interface BeingUpdateGA {
  id: number;
  x: number;
  y: number;
}

export const beingUpdateGADef = registerGADefinition<BeingUpdateGA>({
  encoding: {
    type: "json",
  },
  kind: "being-update",
  key: 0x0021,
});
