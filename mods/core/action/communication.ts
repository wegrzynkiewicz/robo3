import { registerService, resolveService } from "../dependency/service.ts";
import { GAProcessor } from "./processor.ts";
import { GAReceiver, universalGAReceiver } from "./receiver.ts";
import { GARequestor, UniversalGARequestor } from "./requestor.ts";
import { GASender, OnlineGASender } from "./sender.ts";

export interface GACommunicator {
  sender: GASender,
  receiver: GAReceiver,
  requestor: GARequestor,
}

export const onlineGACommunicator = registerService({
  globalKey: 'onlineGACommunicator',
  provider: async (
    _globalContext: unknown,
    { processor, ws }: {
      processor: GAProcessor;
      ws: WebSocket;
    },
  ) => {
    const sender = new OnlineGASender(ws);
    const requestor = new UniversalGARequestor(sender);
    const processors: GAProcessor[] = [requestor, processor];
    const receiver = await resolveService(universalGAReceiver, {processors});
    const communicator: GACommunicator = {
      sender,
      receiver,
      requestor
    }
    return communicator;
  },
});
