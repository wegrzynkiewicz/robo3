import { assertArray, assertObject, isRequiredString, throws } from "../../common/asserts.ts";
import { Registry } from "../../common/registry.ts";
import { deepClone } from "../../common/useful.ts";
import { ComplexGameObjectType, GameObjectTypeCommon, SimpleGameObjectType } from "./foundation.ts";
import { GameObjectProcessorConstructor } from "./processor.ts";
import { defaultGameObjectProperties, GameObjectProperties } from "./properties.ts";

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

export abstract class GameTypeResolver<
  TGameObjectTypeDefinition extends GameObjectTypeDefinitionCommon,
  TGameObjectType extends GameObjectTypeCommon,
> {
  protected readonly gotMap = new Map<string, TGameObjectType>();
  protected readonly registry: Registry<TGameObjectTypeDefinition>;
  protected readonly tree = new Map<string, TGameObjectTypeDefinition[]>();

  public constructor(
    { registry }: {
      registry: Registry<TGameObjectTypeDefinition>;
    },
  ) {
    this.registry = registry;
  }

  protected abstract resolve(definition: TGameObjectTypeDefinition): TGameObjectType;

  protected makeTree(): void {
    for (const gotd of this.registry.entities.values()) {
      const inherit = gotd.inherit ?? "";
      const nodes = this.tree.get(inherit ?? "") ?? [];
      nodes.push(gotd);
      this.tree.set(inherit, nodes);
    }
  }

  protected resolveProperties(gotd: TGameObjectTypeDefinition): GameObjectProperties {
    const { inherit, properties: definedProperties } = gotd;
    if (inherit === undefined) {
      const resolvedProperties = deepClone({
        ...defaultGameObjectProperties,
        ...definedProperties,
      });
      return resolvedProperties;
    }
    const got = this.gotMap.get(inherit) as TGameObjectType;
    if (got === undefined) {
      throws("cannot-resolve-got-by-inherit", { inherit });
    }
    const parentProperties = got.properties;
    const resolvedProperties = deepClone({
      ...parentProperties,
      ...definedProperties,
    });
    return resolvedProperties;
  }

  protected processGameObjectDefinitions(nodes: TGameObjectTypeDefinition[]) {
    for (const child of nodes) {
      const got = this.resolve(child);
      this.gotMap.set(got.gotKey, got);
      const children = this.tree.get(got.gotKey) ?? [];
      this.processGameObjectDefinitions(children);
    }
  }

  public resolveGameObjectTypes(): Map<string, TGameObjectType> {
    this.makeTree();
    const rootNodes = this.tree.get("");
    assertArray(rootNodes, "should-be-array");
    this.processGameObjectDefinitions(rootNodes);
    this.tree.clear();
    return this.gotMap;
  }
}

export class SimpleGameObjectResolver extends GameTypeResolver<
  SimpleGameObjectTypeDefinition,
  SimpleGameObjectType
> {
  protected resolve(sgotd: SimpleGameObjectTypeDefinition): SimpleGameObjectType {
    const { gotKey } = sgotd;
    const sgot: SimpleGameObjectType = {
      gotKey,
      properties: this.resolveProperties(sgotd),
      spriteIndex: 0,
      spriteKey: this.resolveSpriteKey(sgotd),
    };
    return sgot;
  }

  protected resolveSpriteKey(sgotd: SimpleGameObjectTypeDefinition): string {
    const { inherit, spriteKey } = sgotd;
    if (spriteKey) {
      return spriteKey;
    }
    if (inherit) {
      const parent = this.gotMap.get(inherit);
      assertObject(parent, "cannot-resolve-parent-got-by-inherit-key", {
        inherit,
        sgotd,
      });
      return parent.spriteKey;
    }
    throws("empty-sprite-key-in-sgotd", { sgotd });
  }
}

export class ComplexGameObjectResolver extends GameTypeResolver<
  ComplexGameObjectTypeDefinition,
  ComplexGameObjectType
> {
  protected resolve(cgotd: ComplexGameObjectTypeDefinition): ComplexGameObjectType {
    const { gotKey } = cgotd;
    const cgot: ComplexGameObjectType = {
      goProcessor: this.resolveProcessor(cgotd),
      goProcessorOptions: this.resolveOptions(cgotd),
      gotKey,
      properties: this.resolveProperties(cgotd),
      spriteIndexes: {},
      spriteKeys: this.resolveSpriteKeys(cgotd),
    };
    return cgot;
  }

  protected resolveProcessor(cgotd: ComplexGameObjectTypeDefinition): GameObjectProcessorConstructor {
    const { inherit, goProcessor } = cgotd;
    if (isRequiredString(goProcessor)) {
      const definition = gocRegister.entities.get(goProcessor);
      assertObject(definition, "go-processor-with-key-not-found", {
        goProcessor,
        cgotd,
      });
      return definition.processor;
    }
    if (inherit) {
      const parent = this.gotMap.get(inherit);
      assertObject(parent, "cannot-resolve-parent-got-by-inherit-key", {
        inherit,
        cgotd,
      });
      return parent.goProcessor;
    }
    throws("cannot-resolve-go-processor", { cgotd });
  }

  protected resolveOptions(cgotd: ComplexGameObjectTypeDefinition): Record<string, unknown> {
    const { inherit, goProcessorOptions } = cgotd;
    const parent = this.gotMap.get(inherit!);
    const parentOptions = parent ? parent.goProcessorOptions : {};
    const definedOptions = goProcessorOptions ?? {};
    const resolvedOptions = deepClone({
      ...parentOptions,
      ...definedOptions,
    });
    return resolvedOptions;
  }

  protected resolveSpriteKeys(cgotd: ComplexGameObjectTypeDefinition): Record<string, string> {
    const { inherit, spriteKeys } = cgotd;
    const parent = this.gotMap.get(inherit!);
    const parentSpriteKeys = parent ? parent.spriteKeys : {};
    const definedSpriteKeys = spriteKeys ?? {};
    const resolvedSpriteKeys = deepClone({
      ...parentSpriteKeys,
      ...definedSpriteKeys,
    });
    return resolvedSpriteKeys;
  }
}
