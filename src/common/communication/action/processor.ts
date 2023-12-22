import { ServiceResolver } from "../../dependency/service.ts";
import { Breaker } from "../../utils/breaker.ts";
import { CABusSubscriber } from "./bus.ts";
import { AnyCADefinition, AnyCAHandlerBinding, CADefinition, CADispatcher, CAEnvelope, CAHandler, CAHandlerBinding } from "./define.ts";
import { provideCADispatcher } from "./dispatcher.ts";

export class UniversalCAProcessor implements CABusSubscriber {
  public handlers = new Map<AnyCADefinition, AnyCAHandlerBinding>();

  public constructor(
    public readonly dispatcher: CADispatcher,
  ) {}

  public registerHandler<TRequest, TResponse>(
    request: CADefinition<TRequest>,
    response: TResponse extends void ? undefined : CADefinition<TResponse>,
    handler: CAHandler<TRequest, TResponse>,
  ) {
    const binding: CAHandlerBinding<TRequest, TResponse> = { handler, request, response };
    this.handlers.set(request, binding);
  }

  public async subscribe<TData>(definition: CADefinition<TData>, envelope: CAEnvelope<TData>): Promise<void> {
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
        const resultEnvelope: CAEnvelope<unknown> = { id, kind, params: result };
        this.dispatcher.sendEnvelope(response, resultEnvelope);
      }
    } catch (error) {
      throw new Breaker("error-inside-game-action-handler", { definition, envelope, error });
    }
  }
}

export function provideCAProcessor(resolver: ServiceResolver) {
  return new UniversalCAProcessor(
    resolver.resolve(provideCADispatcher),
  ); 
}
