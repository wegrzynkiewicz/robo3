import { EncodingTranslation } from "../../../common/useful.ts";
import { registerService } from "../../dependency/service.ts";

export const actionTranslation = registerService({
  provider: async () => {
    const actionTranslation: EncodingTranslation<string> = {
      byIndex: ["error"],
      byKey: new Map([["error", 0]]),
    };
    return actionTranslation;
  },
});
