import { throws, assertArray, assertObject, isRequiredString } from "../../common/asserts.ts";
import { Registry } from "../../common/registry.ts";
import { deepClone } from "../../common/useful.ts";
import { GameObjectTypeDefinitionCommon, SimpleGameObjectTypeDefinition, ComplexGameObjectTypeDefinition, gocRegister } from "./defining.ts";
import { GameObjectTypeCommon, SimpleGameObjectType, ComplexGameObjectType } from "./foundation.ts";
import { GameObjectProcessorConstructor } from "./processor.ts";
import { GameObjectProperties, defaultGameObjectProperties } from "./properties.ts";

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
  protected resolve(definition: SimpleGameObjectTypeDefinition): SimpleGameObjectType {
    const { gotKey } = definition;
    const sgot: SimpleGameObjectType = {
      definition,
      gotKey,
      properties: this.resolveProperties(definition),
      spriteKey: this.resolveSpriteKey(definition),
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
  protected resolve(definition: ComplexGameObjectTypeDefinition): ComplexGameObjectType {
    const { gotKey } = definition;
    const cgot: ComplexGameObjectType = {
      definition,
      goProcessor: this.resolveProcessor(definition),
      goProcessorOptions: this.resolveOptions(definition),
      gotKey,
      properties: this.resolveProperties(definition),
      spriteKeys: this.resolveSpriteKeys(definition),
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
