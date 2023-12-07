import { Breaker } from "../../../common/utils/breaker.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { UABus, provideMainUABus } from "../ua/uabus.ts";
import { KABusSubscriber } from "./kabus.ts";
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

export function provideKAProcessor(resolver: ServiceResolver) {
  return new KAProcessor(
    resolver.resolve(provideMainUABus),
  );
}
