import { Breaker } from "../../../common/breaker.ts";
import { registerService, ServiceResolver } from "../../../dependency/service.ts";
import { debugDisplayScaleUA, debugDisplayScaleUAHandlerService } from "../debug/actions/debugDisplayScaleUA.ts";
import { debugOpenInfoUA, debugOpenInfoUAHandlerService } from "../debug/actions/debugOpenInfoUA.ts";
import { debugChangeViewportLevelUA, debugChangeViewportLevelUAHandlerService } from "../debug/actions/debugChangeViewportLevelUA.ts";
import { AnyUADefinition, UADefinition } from "./foundation.ts";
import { debugSwitchFreeCameraUA, debugSwitchFreeCameraUAHandlerService } from "../debug/actions/debugSwitchFreeCamera.ts";
import { UABusSubscriber } from "./UABus.ts";
import { mePlayerMoveUA, mePlayerMoveUAHandlerService } from "../move/mePlayerMoveUA.ts";

export interface UAHandler<TData> {
  handle(definition: UADefinition<TData>, data: TData): Promise<void>;
}

export type AnyUAHandler = UAHandler<any>;

export class UAProcessor implements UABusSubscriber {
  public handlers = new Map<AnyUADefinition, AnyUAHandler>();

  public registerHandler<TData>(definition: UADefinition<TData>, handler: UAHandler<TData>): void {
    this.handlers.set(definition, handler);
  }

  public async subscribe<TData>(definition: UADefinition<TData>, data: TData): Promise<void> {
    const handler = this.handlers.get(definition);
    if (!handler) {
      throw new Breaker("ua-handler-not-found", { definition });
    }
    try {
      await handler.handle(definition, data);
    } catch (error) {
      throw new Breaker("error-inside-ua-action-handler", { definition, data, error });
    }
  }
}

export function provideUAProcessor() {
  return new UAProcessor();
}

export async function resolveUAProcessHandlers(resolver: ServiceResolver, processor: UAProcessor) {
  processor.registerHandler(debugOpenInfoUA, resolver.resolve(provideDebugOpenInfoUAHandler));
  processor.registerHandler(debugDisplayScaleUA, resolver.resolve(provideDebugDisplayScaleUAHandler));
  processor.registerHandler(debugChangeViewportLevelUA, resolver.resolve(provideDebugChangeViewportLevelUAHandler));
  processor.registerHandler(debugSwitchFreeCameraUA, resolver.resolve(provideDebugSwitchFreeCameraUAHandler));
  processor.registerHandler(mePlayerMoveUA, resolver.resolve(provideMePlayerMoveUAHandler));
}
