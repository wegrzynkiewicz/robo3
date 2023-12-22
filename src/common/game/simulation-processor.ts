import { beingMoveGADef, provideBeingMoveGAHandler } from "../../actions/being-move/being-move-ga.ts";
import { ServiceResolver } from "../dependency/service.ts";
import { UniversalGAProcessor } from "./action/processor.ts";

export function feedGASimulationProcessor(resolver: ServiceResolver, processor: UniversalGAProcessor) {
  processor.registerHandler(beingMoveGADef, resolver.resolve(provideBeingMoveGAHandler));
}
