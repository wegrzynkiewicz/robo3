import { Router } from "../router.ts";

export async function provideMainWebRouter(): Promise<Router> {
  const router = new Router();
  return router;
}
