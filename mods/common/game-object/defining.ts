import { Registry } from "../../utils/registry.ts";
import { GameObjectProcessorConstructor } from "./processor.ts";
import { GameObjectProperties } from "./properties.ts";

export interface GameObjectTypeDefinitionCommon {
  gotKey: string;
  inherit?: string;
  predefinedGOTIndex?: number;
  properties?: Partial<GameObjectProperties>;
  spriteKey?: string;
}

export interface SimpleGameObjectTypeDefinition extends GameObjectTypeDefinitionCommon {
}

export const sgotdRegistry = new Registry<SimpleGameObjectTypeDefinition>((e) => e.gotKey);
export const defineSimpleGameObjectType = sgotdRegistry.register.bind(sgotdRegistry);

export interface ComplexGameObjectTypeDefinition extends GameObjectTypeDefinitionCommon {
  goProcessor?: string;
  goProcessorOptions?: Record<string, unknown>;
  spriteKeys?: Record<string, string>;
}

export const cgotdRegistry = new Registry<ComplexGameObjectTypeDefinition>((e) => e.gotKey);
export const defineComplexGameObjectType = cgotdRegistry.register.bind(cgotdRegistry);

export interface GameObjectProcessorDefinition {
  gocKey: string;
  processor: GameObjectProcessorConstructor;
}

export const gocRegister = new Registry<GameObjectProcessorDefinition>((e) => e.gocKey);
export const defineGameObjectProcessor = gocRegister.register.bind(gocRegister);
