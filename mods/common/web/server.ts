import { Breaker } from "../utils/breaker.ts";
import { Logger } from "../../core/logger.ts";
import { EPHandler } from "./endpoint.ts";

export interface WebServerConfig {
  hostname: string;
  name: string;
  port: number;
}

export type WebServerHandler = EPHandler;

export class WebServer {
  private readonly abortController = new AbortController();
  public constructor(
    private readonly config: WebServerConfig,
    private readonly handler: WebServerHandler,
    private readonly logger: Logger,
  ) {}

  public async listen(): Promise<void> {
    const promise = new Promise<Deno.HttpServer>((resolve) => {
      const server = Deno.serve({
        handler: this.handle.bind(this),
        hostname: this.config.hostname,
        onError: this.handleError.bind(this),
        onListen: () => {
          this.handleListen();
          resolve(server);
        },
        port: this.config.port,
        signal: this.abortController.signal,
      });
    });
    await promise;
  }

  public close(reason: string): void {
    const { hostname, port } = this.config;
    this.logger.info("Web-server-aborting", { date: new Date(), hostname, port });
    this.abortController.abort(reason);
  }

  private async handle(req: Request): Promise<Response> {
    try {
      const response = await this.handler.handle(req);
      return response;
    } catch (error) {
      throw new Breaker("error-inside-Web-server", { error, req });
    }
  }

  private async handleError(error: unknown): Promise<Response> {
    const payload = { error: "internal-server-error" };
    const response = Response.json(payload, { status: 500 });
    const msg = "error-inside-Web-server-handle-error";
    const breaker = new Breaker(msg, { error });
    this.logger.error(msg, { error: breaker });
    return response;
  }

  private handleListen(): void {
    const { hostname, port } = this.config;
    this.logger.info("Web-server-listening", { date: new Date(), hostname, port });
  }
}
