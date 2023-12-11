import { Breaker } from "../utils/breaker.ts";
import { GACodec, provideGACodec } from "./codec.ts";
import { WebSocketChannelBusSubscriber } from "../web-socket/web-socket-channel-bus.ts";
import { GABus, provideScopedReceivingGABus } from "./bus.ts";
import { ServiceResolver } from "../dependency/service.ts";

export class UniversalGAReceiver implements WebSocketChannelBusSubscriber<MessageEvent> {
  public constructor(
    public readonly codec: GACodec,
    public readonly gaBus: GABus,
  ) { }

  public async subscribe(event: MessageEvent<unknown>): Promise<void> {
    const { data } = event;
    const [definition, envelope] = this.codec.decode(data);
    try {
      await this.gaBus.dispatch(definition, envelope);
    } catch (error) {
      throw new Breaker("error-inside-ga-receiver", { definition, envelope, error });
    }
  }
}

export function provideScopedGAReceiver(resolver: ServiceResolver) {
  return new UniversalGAReceiver(
    resolver.resolve(provideGACodec),
    resolver.resolve(provideScopedReceivingGABus),
  );
}
