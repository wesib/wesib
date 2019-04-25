import { ContextValueSpec } from 'context-values';
import { ArraySet, Class, mergeFunctions, MetaAccessor } from '../common';
import { ComponentContext } from '../component';
import { DefinitionContext } from '../component/definition';
import { BootstrapContext } from '../kit';

/**
 * A key of a property holding a feature definition within its class constructor.
 */
export const FeatureDef__symbol = /*#__PURE__*/ Symbol('feature-def');

/**
 * Feature definition.
 */
export interface FeatureDef {

  /**
   * Features this one requires.
   */
  readonly needs?: Class | readonly Class[];

  /**
   * Features this one provides.
   *
   * The feature always provides itself.
   */
  readonly has?: Class | Class[];

  /**
   * Bootstrap context values to declare prior to bootstrap.
   */
  readonly set?: ContextValueSpec<BootstrapContext, any, any[], any>
      | ContextValueSpec<BootstrapContext, any, any[], any>[];

  /**
   * Bootstraps this feature by calling the given bootstrap context methods.
   *
   * @param context Components bootstrap context.
   */
  readonly init?: (this: Class, context: BootstrapContext) => void;

  /**
   * Definition context values to declare per each component class definition.
   */
  readonly perDefinition?: ContextValueSpec<DefinitionContext<any>, any, any[], any>
      | ContextValueSpec<DefinitionContext<any>, any, any[], any>[];

  /**
   * Component context values to declare per each component construction.
   */
  readonly perComponent?: ContextValueSpec<ComponentContext<any>, any, any[], any>
      | ContextValueSpec<ComponentContext<any>, any, any[], any>[];

}

export namespace FeatureDef {

  /**
   * Mutable feature definition.
   */
  export type Mutable = { -readonly [K in keyof FeatureDef]: FeatureDef[K] };

}

class FeatureMeta extends MetaAccessor<FeatureDef> {

  constructor() {
    super(FeatureDef__symbol);
  }

  merge(...defs: FeatureDef[]): FeatureDef {
    return defs.reduce<FeatureDef.Mutable>(
        (prev, def) => {

          const result: FeatureDef.Mutable = {};
          const set = new ArraySet(prev.set).merge(def.set);
          const needs = new ArraySet(prev.needs).merge(def.needs);
          const has = new ArraySet(prev.has).merge(def.has);
          const init = mergeFunctions<[BootstrapContext], void, Class>(prev.init, def.init);
          const perDefinitions = new ArraySet(prev.perDefinition).merge(def.perDefinition);
          const perComponent = new ArraySet(prev.perComponent).merge(def.perComponent);

          if (set.size) {
            result.set = set.value;
          }
          if (needs.size) {
            result.needs = needs.value;
          }
          if (has.size) {
            result.has = has.value;
          }
          if (init) {
            result.init = init;
          }
          if (perDefinitions.size) {
            result.perDefinition = perDefinitions.value;
          }
          if (perComponent.size) {
            result.perComponent = perComponent.value;
          }

          return result;
        },
        {});
  }

}

const meta = /*#__PURE__*/ new FeatureMeta();

export const FeatureDef = {

  /**
   * Extracts a feature definition from its type.
   *
   * @param featureType Target feature class constructor.
   *
   * @returns A feature definition. May be empty when there is no feature definition found in the given `featureType`.
   */
  of(featureType: Class): FeatureDef {
    return meta.of(featureType) || {};
  },

  /**
   * Merges multiple feature definitions.
   *
   * @param defs Feature definitions to merge.
   *
   * @returns Merged feature definition.
   */
  merge(...defs: FeatureDef[]): FeatureDef {
    return meta.merge(...defs);
  },

  /**
   * Defines a feature.
   *
   * Either creates new or extends an existing feature definition and stores it under `[FeatureDef__symbol]` key.
   *
   * @typeparam T Feature type.
   * @param type Feature class constructor.
   * @param defs Feature definitions.
   *
   * @returns The `type` instance.
   */
  define<T extends Class>(type: T, ...defs: FeatureDef[]): T {
    return meta.define(type, ...defs);
  },

};
