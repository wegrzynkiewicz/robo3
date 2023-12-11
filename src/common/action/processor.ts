import { ServiceResolver } from "../dependency/service.ts";
import { Breaker } from "../utils/breaker.ts";
import { GABusSubscriber } from "./bus.ts";
import { AnyGADefinition, AnyHandlerBinding, GASender, GADefinition, GAHandler, HandlerBinding, GAEnvelope } from "./define.ts";
import { provideScopedGASender } from "./online-sender.ts";

export class UniversalGAProcessor implements GABusSubscriber {
  public handlers = new Map<AnyGADefinition, AnyHandlerBinding>();

  public constructor(
    public readonly sender: GASender,
  ) {}

  public registerHandler<TRequest, TResponse>(
    request: GADefinition<TRequest>,
    response: TResponse extends void ? undefined : GADefinition<TResponse>,
    handler: GAHandler<TRequest, TResponse>,
  ) {
    const binding: HandlerBinding<TRequest, TResponse> = { handler, request, response };
    this.handlers.set(request, binding);
  }

  public async subscribe<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): Promise<void> {
    const binding = this.handlers.get(definition);
    if (!binding) {
      return;
    }
    const { id, params } = envelope;
    const { handler, response } = binding;
    try {
      const result = await handler.handle(params);
      if (response) {
        const { kind } = response;
        const resultEnvelope: GAEnvelope<unknown> = { id, kind, params: result };
        this.sender.sendEnvelope(response, resultEnvelope);
      }
    } catch (error) {
      throw new Breaker("error-inside-game-action-handler", { definition, envelope, error });
    }
  }
}

export function provideScopedGAProcessor(resolver: ServiceResolver) {
  return new UniversalGAProcessor(
    resolver.resolve(provideScopedGASender),
  ); 
}
