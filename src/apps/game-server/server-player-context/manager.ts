import { provideScopedReceivingGABus, provideScopedSendingGABus } from "../../../common/action/bus.ts";
import { provideGACodec } from "../../../common/action/codec.ts";
import { provideScopedGADispatcher } from "../../../common/action/dispatcher.ts";
import { provideScopedOnlineGASender } from "../../../common/action/online-sender.ts";
import { provideScopedGAProcessor } from "../../../common/action/processor.ts";
import { provideScopedGAReceiver } from "../../../common/action/receiver.ts";
import { provideScopedWebSocket } from "../../../common/action/socket.ts";
import { ServiceResolver, provideMainServiceResolver } from "../../../common/dependency/service.ts";
import { provideScopedLogger } from "../../../common/logger/global.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../../common/logger/logger-factory.ts";
import { SpaceManager, provideSpaceManager } from "../../../common/space/space-manager.ts";
import { provideScopedWebSocketChannel } from "../../../common/web-socket/web-socket-channel.ts";
import { provideCloseServerPlayerWebSocketSubscriber } from "./close-server-player-web-socket-subscriber.ts";
import { ServerPlayerContext, provideScopedServerPlayerContext } from "./define.ts";
import { feedServerGAProcessor } from "./ga-processor.ts";

export interface ServerPlayerContextFactoryOption {
  socket: WebSocket;
  token: string,
}

export class ServerPlayerContextManager {

  private playerContextIdCounter = 1;
  public readonly byPlayerContextId = new Map<number, ServerPlayerContext>();

  public constructor(
    public readonly loggerFactory: LoggerFactory,
    public readonly mainServiceResolver: ServiceResolver,
    public readonly spaceManager: SpaceManager,
  ) { }

  public async createServerPlayerContext(options: ServerPlayerContextFactoryOption): Promise<void> {
    const { socket, token } = options;

    const spaceId = 1;

    const playerContextId = this.playerContextIdCounter++;

    const resolver = this.mainServiceResolver.clone([
      provideGACodec,
      provideSpaceManager,
      provideServerPlayerContextManager,
    ]);

    resolver.inject(provideScopedWebSocket, socket);

    const logger = this.loggerFactory.createLogger('PLAYER');
    resolver.inject(provideScopedLogger, logger);

    const dispatcher = resolver.resolve(provideScopedGADispatcher);

    const space = this.spaceManager.obtain(spaceId);
    const being = space.beingManager.create();

    const context: ServerPlayerContext = {
      beingId: being.id,
      dispatcher,
      playerContextId,
      resolver,
      spaceId,
    };
    resolver.inject(provideScopedServerPlayerContext, context);

    const webSocketChannel = resolver.resolve(provideScopedWebSocketChannel);
    {
      const universalGAReceiver = resolver.resolve(provideScopedGAReceiver);
      webSocketChannel.messageBus.subscribers.add(universalGAReceiver);

      const closePlayerServerWebSocketSubscriber = resolver.resolve(provideCloseServerPlayerWebSocketSubscriber);
      webSocketChannel.closeBus.subscribers.add(closePlayerServerWebSocketSubscriber);
    }

    const receivedGABus = resolver.resolve(provideScopedReceivingGABus);
    {
      const processor = resolver.resolve(provideScopedGAProcessor);
      feedServerGAProcessor(resolver, processor);
      receivedGABus.subscribers.add(processor);
    }

    const sendingGABus = resolver.resolve(provideScopedSendingGABus);
    {
      const onlineGASender = resolver.resolve(provideScopedOnlineGASender);
      sendingGABus.subscribers.add(onlineGASender);
    }

    this.byPlayerContextId.set(playerContextId, context);
  }

  public async destroyPlayerContext(playerContextId: number): Promise<void> {
    const context = this.byPlayerContextId.get(playerContextId);
    if (context === undefined) {
      return;
    }
    const { beingId, spaceId } = context;
    const space = this.spaceManager.obtain(spaceId);
    space.beingManager.destroyBeing(beingId);
    this.byPlayerContextId.delete(playerContextId);
  }
}

export function provideServerPlayerContextManager(resolver: ServiceResolver) {
  return new ServerPlayerContextManager(
    resolver.resolve(provideMainLoggerFactory),
    resolver.resolve(provideMainServiceResolver),
    resolver.resolve(provideSpaceManager),
  );
}
