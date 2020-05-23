import { ComponentClass, DefinitionContext } from '../../component/definition';

/**
 * @internal
 */
export const DefinitionContext__symbol = (/*#__PURE__*/ Symbol('definition-context'));

/**
 * @internal
 */
export interface ComponentDefinitionClass<T extends object> extends ComponentClass<T> {
  [DefinitionContext__symbol]?: DefinitionContext<T>;
}

/**
 * @internal
 */
export function definitionContextOf<T extends object>(
    componentType: ComponentDefinitionClass<T>,
): DefinitionContext<T> {
  // eslint-disable-next-line no-prototype-builtins
  if (!componentType.hasOwnProperty(DefinitionContext__symbol)) {
    throw new TypeError(`Component is not defined: ${componentType}`);
  }
  return componentType[DefinitionContext__symbol] as DefinitionContext<T>;
}
