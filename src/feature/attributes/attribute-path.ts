/**
 * A path to sub-state containing element an attributes.
 *
 * Thus, an attribute state path is always something like `[AttributePath__root, 'attribute-name']`.
 */
export const AttributePath__root = /*#__PURE__*/ Symbol('attribute');

/**
 * A path to the named attribute state.
 */
export type AttributePath = [keyof AttributePath.RootMap, string];

/**
 * Constructs a named attribute state path.
 *
 * @param name Target attribute name.
 *
 * @return Attribute state path.
 */
export function attributePathTo(name: string): AttributePath {
  return [AttributePath__root, name];
}

export namespace AttributePath {

  export interface RootMap {
    [AttributePath__root]: true;
  }

}
