import { registerGADefinition } from "../../core/action/foundation.ts";
import { ChunkDTO } from "../../core/chunk/chunk.ts";

export interface ChunksUpdateGA {
  chunks: ChunkDTO[];
}

export const chunksUpdateGADef = registerGADefinition({
  encoding: {
    type: "json",
  },
  kind: "chunks-update",
  key: 0x0010,
});
