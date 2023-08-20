import { logger } from "../../../common/logger.ts";
import { gaCommunicator } from "../../../core/action/communication.ts";
import { gaProcessorService } from "../../../core/action/processor.ts";
import { gaSenderService, OnlineGASender } from "../../../core/action/sender.ts";
import { ServiceResolver } from "../../../core/dependency/service.ts";
import { clientGAProcessor } from "../../../domain-client/clientGAProcessor.ts";
import { loginGARequestDef, loginGAResponseDef } from "../../../domain/loginGA.ts";

(async function () {
  const ws = new WebSocket("ws://token:token@localhost:8000/wss/token");
  ws.binaryType = "arraybuffer";

  const resolver = new ServiceResolver();
  const sender = new OnlineGASender(ws);
  resolver.inject(gaSenderService, sender);
  const processor = await resolver.resolve(clientGAProcessor);
  resolver.inject(gaProcessorService, processor);
  const communicator = await resolver.resolve(gaCommunicator);

  ws.addEventListener("open", async (event) => {
    const { status } = await communicator.requestor.request(
      loginGARequestDef,
      loginGAResponseDef,
      { token: "test" },
    );
    const data = new Uint8Array(8);
  });

  // Listen for messages
  ws.addEventListener("message", async (message) => {
    try {
      await communicator.receiver.receive(message.data);
    } catch (error) {
      logger.error("error-when-processing-wss-message", { error });
    }
  });

  ws.addEventListener("close", (event) => {
    console.log("Close", event);
  });
})();
