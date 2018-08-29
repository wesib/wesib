import { mergeFunctions, MetaAccessor } from '../common';
import { Class } from '../types';
import { mergeLists } from '../util';
import { BootstrapContext } from './bootstrap-context';

/**
 * Web components feature definition.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 */
export interface FeatureDef {

  /**
   * Features this one requires.
   */
  requires?: FeatureType | FeatureType[];

  /**
   * Features this one provides.
   *
   * The feature always provides itself.
   */
  provides?: FeatureType | FeatureType[];

  /**
   * Configures this feature by calling the given configuration context methods.
   *
   * @param context Components bootstrap context.
   */
  configure?: (this: FeatureType, context: BootstrapContext) => void;

}

/**
 * Web components feature type.
 *
 * It is used as an identifier of the feature.
 */
export interface FeatureType<T extends object = object> extends Class<T> {
}

export namespace FeatureDef {

  /**
   * A key of a property holding a web components feature definition within its class constructor.
   */
  export const symbol = Symbol('web-feature-def');

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
            const configure = mergeFunctions<FeatureType, [BootstrapContext], void>(prev.configure, def.configure);

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
   * Extracts a web components feature definition from its type.
   *
   * @param featureType Target feature type.
   *
   * @returns Web component feature definition. May be empty when there is no feature definition found in the given
   * `featureType`.
   */
  export function of(featureType: FeatureType): FeatureDef {
    return meta.of(featureType) || {};
  }

  /**
   * Merges multiple web components feature definitions.
   *
   * @param defs Web components feature definitions to merge.
   *
   * @returns Merged feature definition.
   */
  export function merge(...defs: FeatureDef[]): FeatureDef {
    return meta.merge(...defs);
  }

  /**
   * Defines a web components feature.
   *
   * Either assigns new or extends an existing components feature definition and stores it under `FeatureDef.symbol`
   * key.
   *
   * @param type Web component class constructor.
   * @param defs Web component definitions.
   *
   * @returns The `type` instance.
   */
  export function define<T extends FeatureType>(type: T, ...defs: FeatureDef[]): T {
    return meta.define(type, ...defs);
  }

}
