/**
 * @module @wesib/wesib
 */
/**
 * A path to sub-state containing element an attributes.
 *
 * Thus, an attribute state path is always something like `[AttributePath__root, 'attribute-name']`.
 *
 * @category Feature
 */
export const AttributePath__root = (/*#__PURE__*/ Symbol('attribute'));

/**
 * A path to the named attribute state.
 *
 * @category Feature
 */
export type AttributePath = readonly [keyof AttributePath__root_Keys, string];

/**
 * Constructs a named attribute state path.
 *
 * @category Feature
 * @param name  Target attribute name.
 *
 * @return Attribute state path.
 */
export function attributePathTo(name: string): AttributePath {
  return [AttributePath__root, name];
}

/**
 * @category Feature
 */
// tslint:disable-next-line:class-name
export interface AttributePath__root_Keys {
  [AttributePath__root]: true;
}
