import { GAJsonCodec } from "../../core/action/codec.ts";
import { registerGADefinition } from "../../core/action/foundation.ts";
import { ChunkDTO } from "../../core/chunk/chunk.ts";

export interface ChunksUpdateGA {
  chunks: ChunkDTO[];
}

export const chunksUpdateGADef = registerGADefinition({
  code: "chunks-update",
  index: 0x0010,
  notify: new GAJsonCodec<ChunksUpdateGA>(),
  type: "notification",
});
