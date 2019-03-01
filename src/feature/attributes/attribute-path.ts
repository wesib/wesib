/**
 * A path to sub-state containing element an attributes.
 *
 * Thus, an attribute state path is always something like `[attributePath__root, 'attribute-name']`.
 */
export const attributePath__root = /*#__PURE__*/ Symbol('attribute');

/**
 * Constructs a named attribute state path.
 *
 * @param name Target attribute name.
 *
 * @return Attribute state path.
 */
export function attributePath(name: string): [typeof attributePath__root, string] {
  return [attributePath__root, name];
}
