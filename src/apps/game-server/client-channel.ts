import { WebSocketChannel } from "../../common/web-socket/web-socket-channel.ts";

export class ClientChannel {
  public constructor(
    public readonly clientId: number,
    public readonly webSocketChannel: WebSocketChannel,
  ) { }
}
