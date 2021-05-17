import { Class, elementOrArray, extendSetOfElements, setOfElements } from '@proc7ts/primitives';
import { BootstrapSetup } from '../boot';
import { MetaAccessor } from '../common';
import { FeatureContext } from './feature-context';
import { mergeInitMethods } from './init-method.impl';

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
   * @param setup - Bootstrap setup.
   *
   * @returns Either nothing when setup completed synchronously, or a promise-like instance resolved when setup
   * completed asynchronously.
   */
  setup?(setup: BootstrapSetup): void | PromiseLike<unknown>;

  /**
   * Initializes this feature by calling the given bootstrap context constructed.
   *
   * @param context - Feature initialization context.
   *
   * @returns Either nothing when initialization completed synchronously, or a promise-like instance resolved when
   * initialization completed asynchronously.
   */
  init?(context: FeatureContext): void | PromiseLike<unknown>;

}

/**
 * @internal
 */
class FeatureMeta extends MetaAccessor<FeatureDef, FeatureDef> {

  constructor() {
    super(FeatureDef__symbol);
  }

  merge(defs: readonly FeatureDef[]): FeatureDef {
    return defs.reduce<FeatureDef>(
        (prev, def) => ({
          needs: elementOrArray(extendSetOfElements(setOfElements(prev.needs), def.needs)),
          has: elementOrArray(extendSetOfElements(setOfElements(prev.has), def.has)),
          setup: mergeInitMethods(prev, prev.setup, def, def.setup),
          init: mergeInitMethods(prev, prev.init, def, def.init),
        }),
        {},
    );
  }

  meta(source: FeatureDef, _type: Class): FeatureDef {
    return source;
  }

}

/**
 * @internal
 */
const featureMeta = (/*#__PURE__*/ new FeatureMeta());

/**
 * @category Core
 */
export const FeatureDef = {

  /**
   * Extracts feature definition options from its type.
   *
   * @param featureType - Target feature class constructor.
   *
   * @returns Feature definition options. May be empty when there is no feature definition found in the given
   * `featureType`.
   */
  of(this: void, featureType: Class): FeatureDef {
    return featureMeta.of(featureType) || {};
  },

  /**
   * Builds feature definition options for the given feature class.
   *
   * @param featureType - Target feature class constructor.
   * @param def - A feature definition.
   *
   * @returns Feature definition options.
   */
  for(this: void, featureType: Class, def: FeatureDef): FeatureDef {
    return featureMeta.meta(def, featureType);
  },

  /**
   * Merges multiple feature definition options.
   *
   * @param defs - Feature definition options to merge.
   *
   * @returns Merged feature definition options.
   */
  merge(this: void, ...defs: readonly FeatureDef[]): FeatureDef {
    return featureMeta.merge(defs);
  },

  /**
   * Merges multiple feature definitions.
   *
   * @param defs - Feature definitions to merge.
   *
   * @returns Merged feature definition.
   */
  all(this: void, ...defs: readonly FeatureDef[]): FeatureDef {
    return featureMeta.merge(defs);
  },

  /**
   * Defines a feature.
   *
   * Either creates new or extends an existing feature definition and stores it under `[FeatureDef__symbol]` key.
   *
   * @typeParam TClass - Feature type.
   * @param featureType - Feature class constructor.
   * @param defs - Feature definitions.
   *
   * @returns The `type` instance.
   */
  define<TClass extends Class>(this: void, featureType: TClass, ...defs: readonly FeatureDef[]): TClass {
    return featureMeta.define(featureType, defs);
  },

};
