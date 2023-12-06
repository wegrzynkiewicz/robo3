import { ServiceResolver } from "../../dependency/service.ts";
import { Router } from "../router.ts";

export async function provideMainWebRouter(resolver: ServiceResolver): Promise<Router> {
  const router = new Router();
  return router
}
