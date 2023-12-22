import { Breaker } from "../../utils/breaker.ts";
import { GABusSubscriber } from "./bus.ts";
import { AnyGAHandlerBinding } from "./define.ts";
import { AnyGADefinition, GADefinition, GAEnvelope } from "./define.ts";
import { GAHandlerBinding } from "./define.ts";
import { GAHandler } from "./define.ts";

export class UniversalGAProcessor implements GABusSubscriber {
  public handlers = new Map<AnyGADefinition, AnyGAHandlerBinding>();

  public registerHandler<TData>(
    definition: GADefinition<TData>,
    handler: GAHandler<TData>,
  ) {
    const binding: GAHandlerBinding<TData> = { definition, handler };
    this.handlers.set(definition, binding);
  }

  public async subscribe<TData>(definition: GADefinition<TData>, envelope: GAEnvelope<TData>): Promise<void> {
    const binding = this.handlers.get(definition);
    if (!binding) {
      return;
    }
    const { params } = envelope;
    try {
      await binding.handler.handle(params);
    } catch (error) {
      throw new Breaker("error-inside-game-action-handler", { definition, envelope, error });
    }
  }
}

export function provideScopedGAProcessor() {
  return new UniversalGAProcessor(); 
}
