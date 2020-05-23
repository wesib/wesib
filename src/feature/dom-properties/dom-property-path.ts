/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
/**
 * A path to sub-state containing DOM properties.
 *
 * Thus a property state path is always something like `[DomPropertyPath__root, 'property-name']`.
 *
 * @category Feature
 */
export const DomPropertyPath__root = (/*#__PURE__*/ Symbol('dom-property'));

/**
 * A path to the named DOM property state.
 *
 * @category Feature
 */
export type DomPropertyPath<K extends PropertyKey = PropertyKey> = readonly [keyof DomPropertyPath.RootKeys, K];

/**
 * Constructs a named DOM property state path.
 *
 * @category Feature
 * @param key  Target property key.
 *
 * @return DOM property state path.
 */
export function domPropertyPathTo<K extends PropertyKey = PropertyKey>(key: K): DomPropertyPath<K> {
  return [DomPropertyPath__root, key];
}

/**
 * @category Feature
 */
export namespace DomPropertyPath {
  export interface RootKeys {
    [DomPropertyPath__root]: true;
  }
}
