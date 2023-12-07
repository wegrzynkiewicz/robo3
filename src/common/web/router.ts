import { Breaker } from "../utils/breaker.ts";
import { EPHandler } from "./endpoint.ts";
import { WebServerHandler } from "./server.ts";

export class URLNotMatchHandler implements WebServerHandler {
  public async handle(): Promise<Response> {
    const payload = {
      error: {
        message: "url-not-match",
      },
    };
    const response = Response.json(payload, { status: 404 });
    return response;
  }
}

export class Router implements WebServerHandler {
  public readonly handlers: EPHandler[] = [];
  private readonly notMatchHandler = new URLNotMatchHandler();

  public async handle(req: Request): Promise<Response> {
    for (const handler of this.handlers) {
      const { method, urlPattern } = handler.route;
      if (req.method === method && urlPattern.test(req.url)) {
        const match = urlPattern.exec(req.url);
        if (match === null) {
          throw new Breaker("cannot-match-url-params", { req, urlPattern });
        }
        const input = {
          params: { ...match.pathname.groups },
          request: req,
          url: new URL(req.url),
        };
        try {
          const { response } = await handler.handle(input);
          return response;
        } catch (error: unknown) {
          throw new Breaker("error-inside-router", { error, req });
        }
      }
    }
    return this.notMatchHandler.handle();
  }
}
