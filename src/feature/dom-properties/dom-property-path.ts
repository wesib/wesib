/**
 * A path to sub-state containing DOM properties.
 *
 * Thus a property state path is always something like `[domPropertyPathRoot, 'property-name']`.
 */
export const domPropertyPathRoot = /*#__PURE__*/ Symbol('dom-property');

/**
 * Constructs a named DOM property state path.
 *
 * @param key Target property key.
 *
 * @return DOM property state path.
 */
export function domPropertyPath(key: PropertyKey): [typeof domPropertyPathRoot, PropertyKey] {
  return [domPropertyPathRoot, key];
}
