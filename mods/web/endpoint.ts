export interface EPHandler {
  handle(req: Request): Promise<Response>;
}

export interface EPBinding {
  handler: EPHandler;
  urlPattern: URLPattern;
}
