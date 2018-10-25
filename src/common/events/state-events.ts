import { ContextValueKey, SingleValueKey } from '../context';
import { noop } from '../functions';

/**
 * A state updates consumer function.
 *
 * It is called when the value with the given `key` changes.
 *
 * @param <V> A type of changed value.
 * @param path A path to changed state part.
 * @param newValue New value.
 * @param oldValue Previous value.
 */
export type StateUpdater = <V>(this: void, path: StatePath, newValue: V, oldValue: V) => void;

export namespace StateUpdater {

  /**
   * A key of component context value containing a component state updates consumer function.
   *
   * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
   * modified.
   *
   * Note that this value is not provided, unless the `StateSupport` feature is enabled.
   */
  export const key: ContextValueKey<StateUpdater> = new SingleValueKey('state-update', () => noop);

}

/**
 * A path to state or its part. E.g. property value.
 *
 * May consist of one or more property keys.
 *
 * An array consisting of the only one property key is the same as this property key.
 *
 * The empty array is a path to the state itself.
 */
export type StatePath = PropertyKey | StatePath.Normalized;

export namespace StatePath {

  /**
   * Normalized state path.
   *
   * This is always a tuple of property keys.
   */
  export type Normalized = PropertyKey[];

  /**
   * A path to sub-state containing element properties.
   *
   * Thus a property state path is always something like `[StatePath.property, 'property-name']`.
   */
  export const property = Symbol('property');

  /**
   * A path to sub-state containing element an attributes.
   *
   * Thus, an attribute state path is always something like `[StatePath.attribute, 'attribute-name']`.
   */
  export const attribute = Symbol('attribute');

  export function of<K extends PropertyKey>(key: K): [K];

  export function of(path: StatePath): Normalized;

  /**
   * Normalizes state path. I.e. converts it to tuple.
   *
   * @param path Arbitrary state path.
   *
   * @return Normalized state path.
   */
  export function of(path: StatePath): Normalized {
    return Array.isArray(path) ? path : [path];
  }

}
