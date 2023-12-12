import { Breaker } from "../utils/breaker.ts";
import { Logger } from "../logger/global.ts";

export interface WebServerConfig {
  hostname: string;
  name: string;
  port: number;
}

export interface WebServerHandler {
  handle(req: Request): Promise<Response>;
}

export class WebServer {
  private readonly abortController = new AbortController();
  public constructor(
    private readonly config: WebServerConfig,
    private readonly handler: WebServerHandler,
    private readonly logger: Logger,
  ) { }

  public async listen(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      Deno.serve({
        handler: this.handle.bind(this),
        hostname: this.config.hostname,
        onError: this.handleError.bind(this),
        onListen: () => {
          this.handleListen();
          resolve();
        },
        port: this.config.port,
        signal: this.abortController.signal,
      });
    });
    await promise;
  }

  public close(reason: string): void {
    this.logger.info("web-server-aborting");
    this.abortController.abort(reason);
  }

  private async handle(req: Request): Promise<Response> {
    const { method, url } = req;
    const headers = Object.fromEntries([...req.headers]);
    this.logger.debug("web-server-handling", { headers, method, url });
    try {
      const response = await this.handler.handle(req);
      return response;
    } catch (error) {
      throw new Breaker("error-inside-web-server-handler", { error, headers, method, url });
    }
  }

  private async handleError(error: unknown): Promise<Response> {
    const payload = { error: "internal-server-error" };
    const response = Response.json(payload, { status: 500 });
    const msg = "error-inside-web-server-handle-error";
    const breaker = new Breaker(msg, { error });
    this.logger.error(msg, { error: breaker });
    return response;
  }

  private handleListen(): void {
    this.logger.info("web-server-listening");
  }
}
