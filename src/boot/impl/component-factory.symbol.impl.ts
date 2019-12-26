import { ComponentClass, ComponentFactory } from '../../component/definition';

/**
 * @internal
 */
export const ComponentFactory__symbol = (/*#__PURE__*/ Symbol('component-factory'));

/**
 * @internal
 */
export function componentFactoryOf<T extends object>(componentType: ComponentClass<T>): ComponentFactory<T> {

  const factory = (componentType as any)[ComponentFactory__symbol];

  if (!factory) {
    throw new TypeError(`Component is not defined: ${componentType}`);
  }

  return factory;
}
