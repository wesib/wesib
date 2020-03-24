import { ComponentClass, DefinitionContext } from '../../component/definition';

/**
 * @internal
 */
export const DefinitionContext__symbol = (/*#__PURE__*/ Symbol('definition-context'));

/**
 * @internal
 */
export function definitionContextOf<T extends object>(componentType: ComponentClass<T>): DefinitionContext<T> {
  // eslint-disable-next-line no-prototype-builtins
  if (!componentType.hasOwnProperty(DefinitionContext__symbol)) {
    throw new TypeError(`Component is not defined: ${componentType}`);
  }
  return (componentType as any)[DefinitionContext__symbol];
}
