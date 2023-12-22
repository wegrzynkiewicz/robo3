import { Breaker } from "../utils/breaker.ts";
import { JABusSubscriber } from "./bus.ts";
import { AnyJAHandlerBinding } from "./define.ts";
import { AnyJADefinition, JADefinition, JAEnvelope } from "./define.ts";
import { JAHandlerBinding } from "./define.ts";
import { JAHandler } from "./define.ts";

export class UniversalJAProcessor implements JABusSubscriber {
  public handlers = new Map<AnyJADefinition, AnyJAHandlerBinding>();

  public registerHandler<TData>(
    definition: JADefinition<TData>,
    handler: JAHandler<TData>,
  ) {
    const binding: JAHandlerBinding<TData> = { definition, handler };
    this.handlers.set(definition, binding);
  }

  public async subscribe<TData>(definition: JADefinition<TData>, envelope: JAEnvelope<TData>): Promise<void> {
    const binding = this.handlers.get(definition);
    if (!binding) {
      return;
    }
    const { params } = envelope;
    try {
      await binding.handler.handle(params);
    } catch (error) {
      throw new Breaker("error-inside-job-action-handler", { definition, envelope, error });
    }
  }
}

export function provideJAProcessor() {
  return new UniversalJAProcessor(); 
}
