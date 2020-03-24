import { ComponentClass, DefinitionContext } from '../../component/definition';

/**
 * @internal
 */
export const DefinitionContext__symbol = (/*#__PURE__*/ Symbol('definition-context'));

/**
 * @internal
 */
export function definitionContextOf<T extends object>(componentType: ComponentClass<T>): DefinitionContext<T> {

  const context = (componentType as any)[DefinitionContext__symbol];

  if (!context) {
    throw new TypeError(`Component is not defined: ${componentType}`);
  }

  return context;
}
