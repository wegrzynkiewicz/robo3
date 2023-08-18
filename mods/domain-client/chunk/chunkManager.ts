import { ChunkManager } from "../../core/chunk/chunk.ts";
import { registerService } from "../../core/dependency/service.ts";

export const chunkManagerService = registerService({
  provider: async () => (new ChunkManager()),
});
