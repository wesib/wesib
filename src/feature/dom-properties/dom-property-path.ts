/**
 * A path to sub-state containing DOM properties.
 *
 * Thus a property state path is always something like `[DomPropertyPath__root, 'property-name']`.
 */
export const DomPropertyPath__root = /*#__PURE__*/ Symbol('dom-property');

/**
 * A path to the named DOM property state.
 */
export type DomPropertyPath<K extends PropertyKey = PropertyKey> = [keyof DomPropertyPath.RootMap, K];

/**
 * Constructs a named DOM property state path.
 *
 * @param key Target property key.
 *
 * @return DOM property state path.
 */
export function domPropertyPathTo<K extends PropertyKey = PropertyKey>(key: K): DomPropertyPath<K> {
  return [DomPropertyPath__root, key];
}

export namespace DomPropertyPath {
  export interface RootMap {
    [DomPropertyPath__root]: true,
  }
}
