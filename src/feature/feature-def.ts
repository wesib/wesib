/**
 * @module @wesib/wesib
 */
import { ContextValueSpec } from 'context-values';
import { BootstrapContext } from '../boot';
import { ArraySet, Class, mergeFunctions, MetaAccessor } from '../common';
import { ComponentContext } from '../component';
import { DefinitionContext } from '../component/definition';
import { FeatureContext } from './feature-context';

/**
 * A key of a property holding a feature definition within its class constructor.
 *
 * @category Core
 */
export const FeatureDef__symbol = /*#__PURE__*/ Symbol('feature-def');

/**
 * Feature definition.
 *
 * @category Core
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
  readonly has?: Class | readonly Class[];

  /**
   * Bootstrap context value(s) to declare prior to bootstrap.
   */
  readonly set?:
      | ContextValueSpec<BootstrapContext, any, any[], any>
      | ContextValueSpec<BootstrapContext, any, any[], any>[];

  /**
   * Definition context value(s) to declare per each component class definition.
   */
  readonly perDefinition?:
      | ContextValueSpec<DefinitionContext, any, any[], any>
      | ContextValueSpec<DefinitionContext, any, any[], any>[];

  /**
   * Component context value(s) to declare per each component construction.
   */
  readonly perComponent?:
      | ContextValueSpec<ComponentContext, any, any[], any>
      | ContextValueSpec<ComponentContext, any, any[], any>[];

  /**
   * Bootstraps this feature by calling the given bootstrap context methods.
   *
   * @param this  Feature class.
   * @param context  Feature initialization context.
   */
  init?(this: Class, context: FeatureContext): void;

}

class FeatureMeta extends MetaAccessor<FeatureDef> {

  constructor() {
    super(FeatureDef__symbol);
  }

  merge(...defs: readonly FeatureDef[]): FeatureDef {
    return defs.reduce<FeatureDef>(
        (prev, def) => ({
          set: new ArraySet(prev.set).merge(def.set).value,
          needs: new ArraySet(prev.needs).merge(def.needs).value,
          has: new ArraySet(prev.has).merge(def.has).value,
          init: mergeFunctions<[FeatureContext], void, Class>(prev.init, def.init),
          perDefinition: new ArraySet(prev.perDefinition).merge(def.perDefinition).value,
          perComponent: new ArraySet(prev.perComponent).merge(def.perComponent).value,
        }),
        {});
  }

}

const meta = /*#__PURE__*/ new FeatureMeta();

/**
 * @category Core
 */
export const FeatureDef = {

  /**
   * Extracts a feature definition from its type.
   *
   * @param featureType  Target feature class constructor.
   *
   * @returns A feature definition. May be empty when there is no feature definition found in the given `featureType`.
   */
  of(featureType: Class): FeatureDef {
    return meta.of(featureType) || {};
  },

  /**
   * Merges multiple feature definitions.
   *
   * @param defs  Feature definitions to merge.
   *
   * @returns Merged feature definition.
   */
  merge(...defs: readonly FeatureDef[]): FeatureDef {
    return meta.merge(...defs);
  },

  /**
   * Defines a feature.
   *
   * Either creates new or extends an existing feature definition and stores it under `[FeatureDef__symbol]` key.
   *
   * @typeparam T  Feature type.
   * @param type  Feature class constructor.
   * @param defs  Feature definitions.
   *
   * @returns The `type` instance.
   */
  define<T extends Class>(type: T, ...defs: readonly FeatureDef[]): T {
    return meta.define(type, ...defs);
  },

};
