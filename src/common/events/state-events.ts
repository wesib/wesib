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
export type StateUpdateConsumer = <V>(this: void, key: StateValueKey, newValue: V, oldValue: V) => void;

/**
 * A key of the state value.
 *
 * May consist of one or more key elements.
 *
 * An array consisting of the only one key element is the same as this key element.
 */
export type StateValueKey = PropertyKey | [PropertyKey, ...PropertyKey[]];

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

}
