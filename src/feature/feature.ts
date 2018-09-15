import { Class, ContextValueSpec, mergeFunctions, MetaAccessor } from '../common';
import { mergeLists } from '../util';
import { BootstrapContext } from './bootstrap-context';

/**
 * Feature definition.
 */
export interface FeatureDef {

  /**
   * Features this one requires.
   */
  require?: Class | Class[];

  /**
   * Features this one provides.
   *
   * The feature always provides itself.
   */
  provide?: Class | Class[];

  /**
   * Bootstrap context values to declare prior to bootstrap.
   */
  prebootstrap?: ContextValueSpec<BootstrapContext, any, any> | ContextValueSpec<BootstrapContext, any, any>[];

  /**
   * Bootstraps this feature by calling the given bootstrap context methods.
   *
   * @param context Components bootstrap context.
   */
  bootstrap?: (this: Class, context: BootstrapContext) => void;

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
            const bootstraps = mergeLists(prev.prebootstrap, def.prebootstrap);
            const requires = mergeLists(prev.require, def.require);
            const provides = mergeLists(prev.provide, def.provide);
            const configure = mergeFunctions<[BootstrapContext], void, Class>(prev.bootstrap, def.bootstrap);

            if (bootstraps !== undefined) {
              result.prebootstrap = bootstraps;
            }
            if (requires !== undefined) {
              result.require = requires;
            }
            if (provides !== undefined) {
              result.provide = provides;
            }
            if (configure) {
              result.bootstrap = configure;
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
