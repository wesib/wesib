/**
 * A path to sub-state containing DOM properties.
 *
 * Thus a property state path is always something like `[domPropertyPath__root, 'property-name']`.
 */
export const domPropertyPath__root = /*#__PURE__*/ Symbol('dom-property');

/**
 * Constructs a named DOM property state path.
 *
 * @param key Target property key.
 *
 * @return DOM property state path.
 */
export function domPropertyPath(key: PropertyKey): [typeof domPropertyPath__root, PropertyKey] {
  return [domPropertyPath__root, key];
}
