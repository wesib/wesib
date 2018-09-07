/**
 * A consumer of state updates.
 *
 * It is called when the value with the given `key` changes.
 *
 * @param <V> A type of changed value.
 * @param key Changed value key.
 * @param newValue New value.
 * @param oldValue Previous value.
 */
import { list2array } from '../../util';

export type StateUpdateConsumer = <V>(this: void, key: StateValueKey, newValue: V, oldValue: V) => void;

/**
 * A key of the state value.
 *
 * May consist of one or more property keys.
 *
 * An array consisting of the only one property key is the same as this property key.
 */
export type StateValueKey = PropertyKey | NormalizedStateValueKey;

/**
 * Normalized state value key.
 *
 * This is always a tuple of property keys.
 */
export type NormalizedStateValueKey = PropertyKey[];

export namespace StateValueKey {

  /**
   * State value key element preceding a property key.
   *
   * Thus a property key is always something like `[StateValueKey.property, 'property-name']`.
   */
  export const property = Symbol('property');

  /**
   * State value key element preceding an attribute name.
   *
   * Thus, an attribute key is always something like `[StateValueKey.attribute, 'attribute-name']`.
   */
  export const attribute = Symbol('attribute');

  export function normalize<K extends PropertyKey>(key: K): [K];

  export function normalize(key: NormalizedStateValueKey): NormalizedStateValueKey;

  /**
   * Normalizes state value key. I.e. converts it to tuple.
   *
   * @param key Arbitrary state value key.
   *
   * @return Normalized state value key.
   */
  export function normalize(key: StateValueKey): NormalizedStateValueKey {
    return list2array(key);
  }

}
