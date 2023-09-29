import { debugDisplayScaleUA } from "../debug/debugDisplayScaleUA.ts";
import { debugOpenInfoUA } from "../debug/debugOpenInfoUA.ts";
import { debugSetViewportDepthUA } from "../debug/debugSetViewportDepthUA.ts";
import { UADefinition } from "../ua/foundation.ts";

export const debugActions: UADefinition<any>[] = [
  debugOpenInfoUA,
  debugDisplayScaleUA,
  debugSetViewportDepthUA,
];
