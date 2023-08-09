import { clientGAProcessor } from "../../../client-domain/action/bootstrap.ts";
import { logger } from "../../../common/logger.ts";
import { onlineGACommunicator } from "../../../core/action/communication.ts";
import { resolveService } from "../../../core/dependency/service.ts";
import { loginGA } from "../../../domain/login.ts";

(async function () {
  const ws = new WebSocket("ws://token:token@localhost:8000/wss/token");
  ws.binaryType = "arraybuffer";
  const processor = await resolveService(clientGAProcessor);
  const communicator = await resolveService(onlineGACommunicator, { processor, ws });

  ws.addEventListener("open", (event) => {
    const test = communicator.request(loginGA, { token: "siema" });
    const data = new Uint8Array(8);
    data.set([1, 2, 3, 4, 5, 6, 7, 8]);
    communicator.request("encoder", { type: 123, data });
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
