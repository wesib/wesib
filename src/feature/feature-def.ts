/**
 * @module @wesib/wesib
 */
import { itsReduction } from 'a-iterable';
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

export namespace FeatureDef {

  /**
   * Feature definition source.
   *
   * An instances of this type accepted when {@link FeatureDef.define defining a feature}.
   *
   * This can be one of:
   * - feature definition,
   * - feature definition holder, or
   * - feature definition factory.
   */
  export type Source =
      | FeatureDef
      | Holder
      | Factory;

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

class FeatureMeta extends MetaAccessor<FeatureDef, FeatureDef.Source> {

  constructor() {
    super(FeatureDef__symbol);
  }

  merge(defs: Iterable<FeatureDef>): FeatureDef {
    return itsReduction<FeatureDef, FeatureDef>(
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

  meta(source: FeatureDef.Source, type: Class): FeatureDef {

    const def = (source as any)[FeatureDef__symbol];

    if (def != null) {
      return typeof def === 'function' ? (source as any)[FeatureDef__symbol](type) : def;
    }

    return source as FeatureDef;
  }

}

const meta = (/*#__PURE__*/ new FeatureMeta());

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
  of(this: void, featureType: Class): FeatureDef {
    return meta.of(featureType) || {};
  },

  /**
   * Merges multiple feature definitions.
   *
   * @param defs  Feature definitions to merge.
   *
   * @returns Merged feature definition.
   */
  merge(this: void, ...defs: readonly FeatureDef[]): FeatureDef {
    return meta.merge(defs);
  },

  /**
   * Defines a feature.
   *
   * Either creates new or extends an existing feature definition and stores it under `[FeatureDef__symbol]` key.
   *
   * @typeparam T  Feature type.
   * @param featureType  Feature class constructor.
   * @param defs  Feature definition sources.
   *
   * @returns The `type` instance.
   */
  define<T extends Class>(this: void, featureType: T, ...defs: readonly FeatureDef.Source[]): T {
    return meta.define(featureType, defs);
  },

};
