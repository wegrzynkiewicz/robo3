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
    dimension: Dimension;
  };
  description: string;
  spaceId: GlobalId;
  tiles: {
    count: number;
    dimension: Dimension;
  };
  worldId: GlobalId;
}
