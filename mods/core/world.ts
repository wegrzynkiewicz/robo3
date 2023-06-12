import { Dimension } from "./numbers.ts";

export type GlobalId = number;

export interface World {
  spaces: {
    count: number;
  };
  worldId: GlobalId;
}

export interface Space {
  chunks: {
    count: number;
    dim: Dimension;
  };
  description: string;
  spaceId: GlobalId;
  worldId: GlobalId;
}
