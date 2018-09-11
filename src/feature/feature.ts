import { Class, mergeFunctions, MetaAccessor } from '../common';
import { mergeLists } from '../util';
import { BootstrapContext } from './bootstrap-context';
import { BootstrapValue } from './bootstrap-values';

/**
 * Feature definition.
 */
export interface FeatureDef {

  /**
   * Features this one requires.
   */
  requires?: FeatureType | FeatureType[];

  /**
   * Features this one provides and bootstrap context value providers.
   *
   * The feature always provides itself.
   */
  provides?: FeatureType | BootstrapValue<any, any> | (FeatureType | BootstrapValue<any, any>)[];

  /**
   * Configures this feature by calling the given configuration context methods.
   *
   * @param context Components bootstrap context.
   */
  configure?: (this: FeatureType, context: BootstrapContext) => void;

}

/**
 * Feature type.
 *
 * It is used as an identifier of the feature.
 */
export interface FeatureType<T extends object = object> extends Class<T> {
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
            const requires = mergeLists(prev.requires, def.requires);
            const provides = mergeLists(prev.provides, def.provides);
            const configure = mergeFunctions<[BootstrapContext], void, FeatureType>(prev.configure, def.configure);

            if (requires !== undefined) {
              result.requires = requires;
            }
            if (provides !== undefined) {
              result.provides = provides;
            }
            if (configure) {
              result.configure = configure;
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
   * @param featureType Target feature type.
   *
   * @returns A feature definition. May be empty when there is no feature definition found in the given `featureType`.
   */
  export function of(featureType: FeatureType): FeatureDef {
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
  export function define<T extends FeatureType>(type: T, ...defs: FeatureDef[]): T {
    return meta.define(type, ...defs);
  }

}
