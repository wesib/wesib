import { mergeFunctions, superClassOf } from '../common';
import { ComponentType } from '../component';
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

export namespace FeatureDef {

  /**
   * A key of a property holding a web components feature definition within its class constructor.
   */
  export const symbol = Symbol('web-feature-def');

  /**
   * Extracts a web components feature definition from its type.
   *
   * @param featureType Target feature type.
   *
   * @returns Web component feature definition. May be empty when there is no feature definition found in the given
   * `featureType`.
   */
  export function of(featureType: FeatureType): FeatureDef {

    const def = featureType[FeatureDef.symbol];
    const superType = superClassOf(featureType, st => FeatureDef.symbol in st) as ComponentType<any, any>;
    const superDef = superType && FeatureDef.of(superType);

    if (!def) {
      return {};
    }

    return superDef && superDef !== def ? FeatureDef.merge(superDef, def) : def;
  }

  /**
   * Merges multiple web components feature definitions.
   *
   * @param defs Web components feature definitions to merge.
   *
   * @returns Merged feature definition.
   */
  export function merge(...defs: FeatureDef[]): FeatureDef {
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

/**
 * Web components feature type.
 *
 * It is used as an identifier of the feature.
 */
export interface FeatureType<T extends object = object> extends Class<T> {
  [FeatureDef.symbol]?: FeatureDef;
}

export namespace FeatureType {

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
  export function define<T extends Class>(type: T, ...defs: FeatureDef[]): T {

    const componentType = type as FeatureType;
    const prevDef = componentType[FeatureDef.symbol];
    let def: FeatureDef;

    if (prevDef) {
      def = FeatureDef.merge(prevDef, ...defs);
    } else {
      def = FeatureDef.merge(...defs);
    }

    Object.defineProperty(
        type,
        FeatureDef.symbol,
        {
          configurable: true,
          value: def,
        });

    return type;
  }

}
