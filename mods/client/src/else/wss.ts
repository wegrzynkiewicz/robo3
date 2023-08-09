import { logger } from "../../../common/logger.ts";
import { onlineGACommunicator } from "../../../core/action/communication.ts";
import { resolveService } from "../../../core/dependency/service.ts";
import { clientGAProcessor } from "../../../domain-client/clientGAProcessor.ts";
import { loginGADef } from "../../../domain/loginGA.ts";

(async function () {
  const ws = new WebSocket("ws://token:token@localhost:8000/wss/token");
  ws.binaryType = "arraybuffer";
  const processor = await resolveService(clientGAProcessor);
  const communicator = await resolveService(onlineGACommunicator, { processor, ws });

  ws.addEventListener("open", async (event) => {
    const { status } = await communicator.request(loginGADef, { token: 'test' });
    console.log(status);
    const data = new Uint8Array(8);
  });

  // Listen for messages
  ws.addEventListener("message", async (message) => {
    try {
      await communicator.receive(message.data);
    } catch (error) {
      logger.error("error-when-processing-wss-message", { error });
    }
  });

  ws.addEventListener("close", (event) => {
    console.log("Close", event);
  });
})();
