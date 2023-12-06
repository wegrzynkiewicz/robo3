import { registerService, ServiceResolver } from "../../dependency/service.ts";
import { GAReceiver, gaReceiverService } from "./receiver.ts";
import { GARequestor, gaRequestorService } from "./requestor.ts";
import { GASender, gaSenderService } from "./sender.ts";

export interface GACommunicator {
  sender: GASender;
  receiver: GAReceiver;
  requestor: GARequestor;
}

export function provideGACommunicator(resolver: ServiceResolver) {
  const communicator: GACommunicator = {
    sender: resolver.resolve(provideGaSender),
    receiver: resolver.resolve(provideGaReceiver),
    requestor: resolver.resolve(provideGaRequestor),
  };
  return communicator;
}
