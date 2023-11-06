import { registerService, ServiceResolver } from "../../dependency/service.ts";
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
    const communicator: GACommunicator = {
      sender: await resolver.resolve(gaSenderService),
      receiver: await resolver.resolve(gaReceiverService),
      requestor: await resolver.resolve(gaRequestorService),
    };
    return communicator;
  },
});
