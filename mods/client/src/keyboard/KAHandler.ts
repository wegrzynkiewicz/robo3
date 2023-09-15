import { registerService } from "../../../core/dependency/service.ts";
import { KADefinition } from "./foundation.ts";

export interface KAHandler {
  handle(definition: KADefinition): Promise<void>
}

export class UniversalKAHandler implements KAHandler {
  public async handle(definition: KADefinition): Promise<void> {
    console.log({ definition });
  }
}

export const universalKAHandlerService = registerService({
  async provider(): Promise<UniversalKAHandler> {
    return new UniversalKAHandler();
  },
});
