import { Dimension } from "./numbers.ts";

export interface World {
  spaces: {
    count: number;
  };
  worldId: string;
}

export interface Space {
  chunks: {
    count: number;
    dim: Dimension;
  };
  description: string;
  spaceId: string;
  worldId: string;
}
export function generateWorld() {
}
