/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { itsReduction } from '@proc7ts/a-iterable';
import { BootstrapSetup } from '../boot';
import { ArraySet, Class, mergeFunctions, MetaAccessor } from '../common';
import { FeatureContext } from './feature-context';

/**
 * A key of a property holding a feature definition within its class constructor.
 *
 * @category Core
 */
export const FeatureDef__symbol = (/*#__PURE__*/ Symbol('feature-def'));

/**
 * Feature definition.
 *
 * This can be one of:
 * - feature definition options object,
 * - feature definition holder, or
 * - feature definition factory.
 *
 * @category Core
 */
export type FeatureDef =
    | FeatureDef.Options
    | FeatureDef.Holder
    | FeatureDef.Factory;

export namespace FeatureDef {

  /**
   * Feature definition options.
   */
  export interface Options {

    readonly [FeatureDef__symbol]?: undefined;

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
     * Sets up bootstrap.
     *
     * This method is called before bootstrap context created.
     *
     * @param setup  Bootstrap setup.
     */
    setup?(setup: BootstrapSetup): void;

    /**
     * Bootstraps this feature by calling the given bootstrap context constructed.
     *
     * @param context  Feature initialization context.
     */
    init?(context: FeatureContext): void;

  }

  /**
   * Feature definition holder.
   */
  export interface Holder {

    /**
     * The feature definition this holder contains.
     */
    readonly [FeatureDef__symbol]: FeatureDef;

  }

  /**
   * Feature definition factory.
   */
  export interface Factory {

    /**
     * Builds feature definition.
     *
     * @param featureType  A feature class constructor to build definition for.
     *
     * @returns Built feature definition.
     */
    [FeatureDef__symbol](featureType: Class): FeatureDef;

  }

}

/**
 * @internal
 */
class FeatureMeta extends MetaAccessor<FeatureDef.Options, FeatureDef> {

  constructor() {
    super(FeatureDef__symbol);
  }

  merge(defs: Iterable<FeatureDef.Options>): FeatureDef.Options {
    return itsReduction<FeatureDef.Options, FeatureDef.Options>(
        defs,
        (prev, def) => ({
          needs: new ArraySet(prev.needs).merge(def.needs).value,
          has: new ArraySet(prev.has).merge(def.has).value,
          setup: mergeFunctions<[BootstrapSetup], void, Class>(prev.setup, def.setup),
          init: mergeFunctions<[FeatureContext], void, Class>(prev.init, def.init),
        }),
        {},
    );
  }

  meta(source: FeatureDef, type: Class): FeatureDef.Options {

    const def = source[FeatureDef__symbol];

    return def == null
        ? source as FeatureDef.Options
        : this.meta(
            typeof def === 'function' ? (source as FeatureDef.Factory)[FeatureDef__symbol](type) : def,
            type,
        );
  }

}

/**
 * @internal
 */
const featureMeta = (/*#__PURE__*/ new FeatureMeta());

/**
 * @internal
 */
const noFeatureDef: FeatureDef.Factory = {
  [FeatureDef__symbol]() {
    return {};
  },
};

/**
 * @category Core
 */
export const FeatureDef = {

  /**
   * Extracts feature definition options from its type.
   *
   * @param featureType  Target feature class constructor.
   *
   * @returns Feature definition options. May be empty when there is no feature definition found in the given
   * `featureType`.
   */
  of(this: void, featureType: Class): FeatureDef.Options {
    return featureMeta.of(featureType) || {};
  },

  /**
   * Builds feature definition options for the given feature class.
   *
   * @param featureType  Target feature class constructor.
   * @param def  A feature definition.
   *
   * @returns Feature definition options.
   */
  for(this: void, featureType: Class, def: FeatureDef): FeatureDef.Options {
    return featureMeta.meta(def, featureType);
  },

  /**
   * Merges multiple feature definition options.
   *
   * @param defs  Feature definition options to merge.
   *
   * @returns Merged feature definition options.
   */
  merge(this: void, ...defs: readonly FeatureDef.Options[]): FeatureDef.Options {
    return featureMeta.merge(defs);
  },

  /**
   * Merges multiple feature definitions.
   *
   * @param defs  Feature definitions to merge.
   *
   * @returns Merged feature definition.
   */
  all(this: void, ...defs: readonly FeatureDef[]): FeatureDef {
    return itsReduction<FeatureDef, FeatureDef.Factory>(
        defs,
        (prev, def) => ({
          [FeatureDef__symbol](featureType: Class) {
            return FeatureDef.merge(
                FeatureDef.for(featureType, prev),
                FeatureDef.for(featureType, def),
            );
          },
        }),
        noFeatureDef,
    );
  },

  /**
   * Defines a feature.
   *
   * Either creates new or extends an existing feature definition and stores it under `[FeatureDef__symbol]` key.
   *
   * @typeparam T  Feature type.
   * @param featureType  Feature class constructor.
   * @param defs  Feature definitions.
   *
   * @returns The `type` instance.
   */
  define<T extends Class>(this: void, featureType: T, ...defs: readonly FeatureDef[]): T {
    return featureMeta.define(featureType, defs);
  },

};
