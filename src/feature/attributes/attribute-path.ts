/**
 * A path to sub-state containing element an attributes.
 *
 * Thus, an attribute state path is always something like `[attributePathRoot, 'attribute-name']`.
 */
export const attributePathRoot = /*#__PURE__*/ Symbol('attribute');

/**
 * Constructs a named attribute state path.
 *
 * @param name Target attribute name.
 *
 * @return Attribute state path.
 */
export function attributePath(name: string): [typeof attributePathRoot, string] {
  return [attributePathRoot, name];
}
