import { Breaker } from "../utils/breaker.ts";
import { CACodec, provideCACodec } from "./codec.ts";
import { WebSocketChannelBusSubscriber } from "../web-socket/web-socket-channel-bus.ts";
import { CABus, provideScopedReceivingCABus } from "./bus.ts";
import { ServiceResolver } from "../dependency/service.ts";

export class UniversalCAReceiver implements WebSocketChannelBusSubscriber<MessageEvent> {
  public constructor(
    public readonly codec: CACodec,
    public readonly gaBus: CABus,
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

export function provideScopedCAReceiver(resolver: ServiceResolver) {
  return new UniversalCAReceiver(
    resolver.resolve(provideCACodec),
    resolver.resolve(provideScopedReceivingCABus),
  );
}
