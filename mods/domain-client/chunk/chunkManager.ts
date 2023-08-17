import { ChunkManager } from "../../core/chunk/chunk.ts";
import { registerService } from "../../core/dependency/service.ts";

export const chunkManager = registerService({
  globalKey: 'chunkManager', 
  provider: async () => (new ChunkManager()),
});
