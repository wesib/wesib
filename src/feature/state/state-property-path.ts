/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
/**
 * A path to sub-state containing component state properties.
 *
 * Thus a property state path is always something like `[StatePropertyPath__root, 'property-name']`.
 *
 * @category Feature
 */
export const StatePropertyPath__root = (/*#__PURE__*/ Symbol('state-property'));

/**
 * A path to the named component property state.
 *
 * @category Feature
 */
export type StatePropertyPath<K extends PropertyKey = PropertyKey> = readonly [keyof StatePropertyPath__rootKeys, K];

/**
 * Constructs a named component property state path.
 *
 * @category Feature
 * @param key  Target property key.
 *
 * @return DOM property state path.
 */
export function statePropertyPathTo<K extends PropertyKey = PropertyKey>(key: K): StatePropertyPath<K> {
  return [StatePropertyPath__root, key];
}

/**
 * @category Feature
 */
// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface StatePropertyPath__rootKeys {
  [StatePropertyPath__root]: true;
}
