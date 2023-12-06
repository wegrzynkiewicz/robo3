import { Breaker } from "../../../common/breaker.ts";
import { ServiceResolver } from "../../../dependency/service.ts";
import { debugDisplayScaleUA, provideDebugDisplayScaleUAHandler } from "../debug/actions/debugDisplayScaleUA.ts";
import { debugOpenInfoUA, provideDebugOpenInfoUAHandler } from "../debug/actions/debugOpenInfoUA.ts";
import { debugChangeViewportLevelUA, provideDebugChangeViewportLevelUAHandler } from "../debug/actions/debugChangeViewportLevelUA.ts";
import { AnyUADefinition, UADefinition } from "./foundation.ts";
import { debugSwitchFreeCameraUA, provideDebugSwitchFreeCameraUAHandler } from "../debug/actions/debugSwitchFreeCamera.ts";
import { UABusSubscriber } from "./UABus.ts";
import { mePlayerMoveUA, provideMePlayerMoveUAHandler } from "../move/mePlayerMoveUA.ts";

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

export function provideMainUAProcessor() {
  return new UAProcessor();
}

export async function resolveUAProcessHandlers(resolver: ServiceResolver, processor: UAProcessor) {
  processor.registerHandler(debugOpenInfoUA, resolver.resolve(provideDebugOpenInfoUAHandler));
  processor.registerHandler(debugDisplayScaleUA, resolver.resolve(provideDebugDisplayScaleUAHandler));
  processor.registerHandler(debugChangeViewportLevelUA, resolver.resolve(provideDebugChangeViewportLevelUAHandler));
  processor.registerHandler(debugSwitchFreeCameraUA, resolver.resolve(provideDebugSwitchFreeCameraUAHandler));
  processor.registerHandler(mePlayerMoveUA, resolver.resolve(provideMePlayerMoveUAHandler));
}
