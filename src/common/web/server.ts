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
    const { hostname, name, port } = this.config;
    this.logger.info("web-server-aborting", { hostname, name, port });
    this.abortController.abort(reason);
  }

  private async handle(req: Request): Promise<Response> {
    try {
      const response = await this.handler.handle(req);
      return response;
    } catch (error) {
      throw new Breaker("error-inside-web-server-handler", {
        error,
        method: req.method,
        url: req.url,
      });
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
    const { hostname, name, port } = this.config;
    this.logger.info("web-server-listening", { hostname, name, port });
  }
}
