import { ServiceResolver } from "../../common/dependency/service.ts";
import { LoggerFactory, provideMainLoggerFactory } from "../../common/logger/logger-factory.ts";
import { WebSocketChannel } from "../../common/web-socket/web-socket-channel.ts";
import { ClientChannel } from "./client-channel.ts";

export interface ClientChannelCreationOptions {
  token: string,
  socket: WebSocket,
}

export class ClientChannelManager {
  public readonly byClientId = new Map<number, ClientChannel>();

  public constructor(
    public readonly loggerFactory: LoggerFactory,
  ) { }

  public createChannel(options: ClientChannelCreationOptions): ClientChannel {
    const { token, socket } = options;
    const clientId = this.byClientId.size;
    const logger = this.loggerFactory.createLogger('WS-CLIENT', { "clientId": clientId });
    const webSocketChannel = new WebSocketChannel(logger, socket);
    const channel = new ClientChannel(clientId, webSocketChannel);
    this.byClientId.set(channel.clientId, channel);
    return channel;
  }
}

export function provideClientChannelManager(resolver: ServiceResolver) {
  return new ClientChannelManager(
    resolver.resolve(provideMainLoggerFactory),
  );
}
