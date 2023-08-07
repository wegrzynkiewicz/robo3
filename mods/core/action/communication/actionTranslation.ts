import { EncodingTranslation } from "../../../common/useful.ts";
import { chunkDataUpdateGameActionCodec } from "../../chunk/chunks-update.ts";
import { registerService } from "../../dependency/service.ts";
import { GameActionCodec } from "../foundation.ts";

export const actionTranslation = registerService({
  provider: async () => {
    const actionTranslation = new EncodingTranslation<GameActionCodec<unknown>>((entry) => (entry));
    actionTranslation.set(chunkDataUpdateGameActionCodec);
    return actionTranslation;
  },
});
