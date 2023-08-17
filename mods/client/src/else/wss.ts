import { logger } from "../../../common/logger.ts";
import { onlineGACommunicator } from "../../../core/action/communication.ts";
import { OnlineGASender } from "../../../core/action/sender.ts";
import { resolveService } from "../../../core/dependency/service.ts";
import { clientGAProcessor } from "../../../domain-client/clientGAProcessor.ts";
import { loginGARequestDef, loginGAResponseDef } from "../../../domain/loginGA.ts";

(async function () {
  const ws = new WebSocket("ws://token:token@localhost:8000/wss/token");
  ws.binaryType = "arraybuffer";
  const sender = new OnlineGASender(ws);
  const processor = await resolveService(clientGAProcessor, { sender });
  const communicator = await resolveService(onlineGACommunicator, { processor, ws });

  ws.addEventListener("open", async (event) => {
    const { status } = await communicator.requestor.request(
      loginGARequestDef,
      loginGAResponseDef,
      { token: "test" }
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
