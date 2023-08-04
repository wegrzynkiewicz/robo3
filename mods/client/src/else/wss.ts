import { clientGameActionProcessor } from "../../../client-domain/action/bootstrap.ts";
import { logger } from "../../../common/logger.ts";
import { onlineRPCGameActionCommunicator } from "../../../core/action/communication/onlineCommunicator.ts";
import { resolveService } from "../../../core/dependency/service.ts";

(async function () {
  const ws = new WebSocket("ws://token:token@localhost:8000/wss/token");
  const processor = await resolveService(clientGameActionProcessor);
  const communicator = await resolveService(onlineRPCGameActionCommunicator, { processor, ws });

  ws.addEventListener("open", (event) => {
    communicator.request("login", { token: "token" });
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
