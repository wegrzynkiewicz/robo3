import { ServiceResolver } from "../dependency/service.ts";
import { GAReceiver, provideGAReceiver } from "./receiver.ts";
import { GARequestor, provideGARequestor } from "./requestor.ts";
import { GASender, provideGASender } from "./sender.ts";

export interface GACommunicator {
  sender: GASender;
  receiver: GAReceiver;
  requestor: GARequestor;
}

export function provideGACommunicator(resolver: ServiceResolver) {
  const communicator: GACommunicator = {
    sender: resolver.resolve(provideGASender),
    receiver: resolver.resolve(provideGAReceiver),
    requestor: resolver.resolve(provideGARequestor),
  };
  return communicator;
}
