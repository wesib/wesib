import { ArraySet, Class, ContextValueSpec, mergeFunctions, MetaAccessor } from '../common';
import { BootstrapContext } from './bootstrap-context';

/**
 * Feature definition.
 */
export interface FeatureDef {

  /**
   * Features this one requires.
   */
  need?: Class | Class[];

  /**
   * Features this one provides.
   *
   * The feature always provides itself.
   */
  has?: Class | Class[];

  /**
   * Bootstrap context values to declare prior to bootstrap.
   */
  set?: ContextValueSpec<BootstrapContext, any, any> | ContextValueSpec<BootstrapContext, any, any>[];

  /**
   * Bootstraps this feature by calling the given bootstrap context methods.
   *
   * @param context Components bootstrap context.
   */
  init?: (this: Class, context: BootstrapContext) => void;

}

export namespace FeatureDef {

  /**
   * A key of a property holding a feature definition within its class constructor.
   */
  export const symbol = Symbol('feature-def');

  class FeatureMeta extends MetaAccessor<FeatureDef> {

    constructor() {
      super(FeatureDef.symbol);
    }

    merge(...defs: FeatureDef[]): FeatureDef {
      return defs.reduce(
          (prev, def) => {

            const result: FeatureDef = {};
            const set = new ArraySet(prev.set).merge(def.set);
            const need = new ArraySet(prev.need).merge(def.need);
            const has = new ArraySet(prev.has).merge(def.has);
            const init = mergeFunctions<[BootstrapContext], void, Class>(prev.init, def.init);

            if (set.size) {
              result.set = set.value;
            }
            if (need.size) {
              result.need = need.value;
            }
            if (has.size) {
              result.has = has.value;
            }
            if (init) {
              result.init = init;
            }

            return result;
          },
          {});
    }

  }

  const meta = new FeatureMeta();

  /**
   * Extracts a feature definition from its type.
   *
   * @param featureType Target feature class constructor.
   *
   * @returns A feature definition. May be empty when there is no feature definition found in the given `featureType`.
   */
  export function of(featureType: Class): FeatureDef {
    return meta.of(featureType) || {};
  }

  /**
   * Merges multiple feature definitions.
   *
   * @param defs Feature definitions to merge.
   *
   * @returns Merged feature definition.
   */
  export function merge(...defs: FeatureDef[]): FeatureDef {
    return meta.merge(...defs);
  }

  /**
   * Defines a feature.
   *
   * Either creates new or extends an existing feature definition and stores it under `[FeatureDef.symbol]` key.
   *
   * @param type Feature class constructor.
   * @param defs Feature definitions.
   *
   * @returns The `type` instance.
   */
  export function define<T extends Class>(type: T, ...defs: FeatureDef[]): T {
    return meta.define(type, ...defs);
  }

}
