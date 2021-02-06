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
 * @typeParam TKey - Property key type.
 */
export type DomPropertyPath<TKey extends PropertyKey = PropertyKey> = readonly [keyof DomPropertyPath.RootKeys, TKey];

/**
 * Constructs a named DOM property state path.
 *
 * @category Feature
 * @typeParam TKey - Property key type.
 * @param key - Target property key.
 *
 * @return DOM property state path.
 */
export function domPropertyPathTo<TKey extends PropertyKey = PropertyKey>(key: TKey): DomPropertyPath<TKey> {
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
