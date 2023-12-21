import { registerCADefinition } from "../../common/action/manager.ts";
import { ChunkDTO } from "../../common/chunk/chunk.ts";

export interface ChunksUpdateCA {
  chunks: ChunkDTO[];
}

export const chunksUpdateCADef = registerCADefinition({
  encoding: {
    type: "json",
  },
  kind: "chunks-update",
});
