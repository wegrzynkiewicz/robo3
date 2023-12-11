import { Breaker } from "../../../common/utils/breaker.ts";
import { ServiceResolver } from "../../../common/dependency/service.ts";
import { debugDisplayScaleUA, provideDebugDisplayScaleUAHandler } from "../../../actions/debug/debug-display-scale-ua.ts";
import { debugOpenInfoUA, provideDebugOpenInfoUAHandler } from "../../../actions/debug/debug-open-info-ua.ts";
import { debugChangeViewportLevelUA, provideDebugChangeViewportLevelUAHandler } from "../../../actions/debug/debug-change-viewport-level-ua.ts";
import { AnyUADefinition, UADefinition } from "./foundation.ts";
import { debugSwitchFreeCameraUA, provideDebugSwitchFreeCameraUAHandler } from "../../../actions/debug/debug.switch-free-camera.ts";
import { UABusSubscriber } from "./uabus.ts";
import { mePlayerMoveUA, provideMePlayerMoveUAHandler } from "../../../actions/player-move/me-player-move-ua.ts";

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
