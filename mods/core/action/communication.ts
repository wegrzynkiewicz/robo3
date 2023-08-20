import { registerService, ServiceResolver } from "../dependency/service.ts";
import { GAReceiver, gaReceiverService } from "./receiver.ts";
import { GARequestor, gaRequestorService } from "./requestor.ts";
import { GASender, gaSenderService } from "./sender.ts";

export interface GACommunicator {
  sender: GASender;
  receiver: GAReceiver;
  requestor: GARequestor;
}

export const gaCommunicator = registerService({
  async provider(resolver: ServiceResolver): Promise<GACommunicator> {
    const [
      sender,
      receiver,
      requestor,
    ] = await Promise.all([
      resolver.resolve(gaSenderService),
      resolver.resolve(gaReceiverService),
      resolver.resolve(gaRequestorService),
    ]);
    const communicator: GACommunicator = {
      sender,
      receiver,
      requestor,
    };
    return communicator;
  },
});
