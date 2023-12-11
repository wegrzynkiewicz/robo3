import { GABusSubscriber, provideScopedReceivingGABus, provideScopedSendingGABus } from "../../../common/action/bus.ts";
import { GACodec, provideGACodec } from "../../../common/action/codec.ts";
import { provideScopedOnlineGASender } from "../../../common/action/online-sender.ts";
import { provideScopedGAProcessor } from "../../../common/action/processor.ts";
import { provideScopedWebSocket } from "../../../common/action/socket.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { feedClientSideGAProcess } from "./ga-processor.ts";

export interface GameContext {
  connector: GABusSubscriber;
  resolver: ServiceResolver;
}

export interface GameContextFactoryOption {
  socket: WebSocket;
}

export class GameContextFactory {
  public constructor(
    private readonly gaCodec: GACodec,
    private readonly loggerFactory: LoggerFactory,
  ) { }

  public async createGameContext(options: GameContextFactoryOption): Promise<GameContext> {
    const { socket } = options;

    const resolver = new ServiceResolver();

    const logger = this.loggerFactory.createLogger('CLIENT');

    resolver.inject(provideScopedWebSocket, socket);
    resolver.inject(provideScopedLogger, logger);
    resolver.inject(provideGACodec, this.gaCodec);

    const receivedGABus = resolver.resolve(provideScopedReceivingGABus);
    const processor = resolver.resolve(provideScopedGAProcessor);
    feedClientSideGAProcess(resolver, processor);
    receivedGABus.subscribers.add(processor);

    const sendingGABus = resolver.resolve(provideScopedSendingGABus);
    const onlineGASender = resolver.resolve(provideScopedOnlineGASender);
    sendingGABus.subscribers.add(onlineGASender);

    // const networkLatencyDaemon = resolver.resolve(provideNetworkLatencyDaemon);
    // const mutationGABusSubscriber = resolver.resolve(provideMutationGABusSubscriber);

    const context: GameContext = {
      connector: sendingGABus,
      resolver,
    };
    return context;
  }
}

export function provideGameContextFactory(resolver: ServiceResolver) {
  return new GameContextFactory(
    resolver.resolve(provideGACodec),
    resolver.resolve(provideMainLoggerFactory),
  );
}
