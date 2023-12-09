import { Breaker } from "../utils/breaker.ts";
import { WebServerHandler } from "./server.ts";

export class GlobalMiddleware implements WebServerHandler {
  public constructor(
    private readonly next: WebServerHandler,
  ) { }

  public async handle(req: Request): Promise<Response> {
    try {
      const response = await this.next.handle(req);
      const { status } = response
      if (status !== 101) {
        response.headers.set("Access-Control-Allow-Origin", "*");
      }
      return response;
    } catch (error) {
      throw new Breaker("error-inside-global-middleware", {
        error,
      });
    }
  }
}
