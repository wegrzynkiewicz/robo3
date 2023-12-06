import { Breaker } from "../../../common/breaker.ts";
import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { mainUABusService, UABus } from "../ua/UABus.ts";
import { KABusSubscriber } from "./KABus.ts";
import { AnyKADefinition } from "./foundation.ts";

export class KAProcessor implements KABusSubscriber {
  public constructor(
    public readonly uaBus: UABus,
  ) {}

  public async subscribe(kaDefinition: AnyKADefinition) {
    const { ua } = kaDefinition;
    if (ua === undefined) {
      throw new Breaker("not-found-ua-definition-in-ka-definition", { kaDefinition });
    }
    const { definition, data } = ua;
    try {
      await this.uaBus.dispatch(definition, data);
    } catch (error) {
      throw new Breaker("error-in-ka-processor", { error, kaDefinition, ua });
    }
  }
}

export const kaProcessorService = registerService({
  name: "kaProcessor",
  async provider(resolver: ServiceResolver): Promise<KAProcessor> {
    return new KAProcessor(
      await resolver.resolve(mainUABusService),
    );
  },
});
