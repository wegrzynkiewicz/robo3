import { Breaker } from "../../common/asserts.ts";
import { registerService } from "../dependency/service.ts";
import { GAEnvelope } from "./codec.ts";
import { AnyGADefinition, GADefinition } from "./foundation.ts";
import { GASender } from "./sender.ts";

export interface GAProcessor {
  canProcess<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): boolean;
  process<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): Promise<void>;
}

export interface GAHandler<TRequest, TResponse> {
  handle(envelope: TRequest): Promise<TResponse>;
}

export type AnyGAHandler = GAHandler<any, any>;

export interface HandlerBinding<TRequest, TResponse> {
  handler: GAHandler<TRequest, TResponse>;
  request: GADefinition<TRequest>;
  response?: GADefinition<TResponse>;
}
export type AnyHandlerBinding = HandlerBinding<any, any>;

export class UniversalGAProcessor implements GAProcessor {
  public handlers = new Map<AnyGADefinition, AnyHandlerBinding>();

  public constructor(
    public readonly sender: GASender,
  ) {
  }

  public registerHandler<TRequest, TResponse>(
    request: GADefinition<TRequest>,
    response: TResponse extends void ? undefined : GADefinition<TResponse>,
    handler: GAHandler<TRequest, TResponse>,
  ) {
    const binding: HandlerBinding<TRequest, TResponse> = { handler, request, response };
    this.handlers.set(request, binding);
  }

  public canProcess<TData>(definition: GADefinition<TData>): boolean {
    return this.handlers.has(definition);
  }

  public async process<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): Promise<void> {
    const binding = this.handlers.get(definition);
    if (!binding) {
      throw new Breaker("game-action-handler-not-found", { definition, envelope });
    }
    try {
      const { id, params } = envelope;
      const { handler, response } = binding;
      const result = await handler.handle(params);
      if (response !== undefined) {
        const { kind, codec } = response;
        const resultEnvelope: GAEnvelope<unknown> = { id, kind, params: result };
        const data = codec.encode(resultEnvelope);
        this.sender.sendRaw(data);
      }
    } catch (error) {
      throw new Breaker("error-inside-game-action-handler", { definition, envelope, error });
    }
  }
}

export const gaProcessorService = registerService({
  async provider(): Promise<GAProcessor> {
    throw new Breaker("main-ga-processor-should-be-injected");
  },
});
