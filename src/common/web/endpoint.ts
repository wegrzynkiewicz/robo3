export type EPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface EPContext {
  params: Record<string, unknown>;
  request: Request;
  url: URL;
}

export class EPRoute {
  public readonly urlPattern: URLPattern;
  public constructor(
    public readonly method: EPMethod,
    pathname: string,
  ) {
    this.urlPattern = new URLPattern({ pathname });
  }
}

export interface EPHandler {
  route: EPRoute;
  handle(ctx: EPContext): Promise<Response>;
}
