import { Breaker } from "../utils/breaker.ts";
import { EPBinding, EPHandler } from "./endpoint.ts";

export class URLNotMatchHandler implements EPHandler {
  public async handle(req: Request): Promise<Response> {
    const payload = {
      error: {
        data: {
          url: req.url,
        },
        message: "url-not-match",
      },
    };
    const response = Response.json(payload, { status: 400 });
    return response;
  }
}

export class Router implements EPHandler {
  public readonly endpoints: EPBinding[] = [];
  private readonly notMatchHandler = new URLNotMatchHandler();

  public async handle(req: Request): Promise<Response> {
    const handler = this.match(req.url);
    try {
      const response = await handler.handle(req);
      return response;
    } catch (error: unknown) {
      throw new Breaker("error-inside-router", { error, req });
    }
  }

  public match(url: string): EPHandler {
    for (const endpoint of this.endpoints) {
      const { handler, urlPattern } = endpoint;
      const match = urlPattern.exec(url);
      if (match === null) {
        continue;
      }
      return handler;
    }
    return this.notMatchHandler;
  }
}
