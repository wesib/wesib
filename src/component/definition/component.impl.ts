import { ComponentContext, ComponentContext__symbol } from '../component-context';
import { ComponentClass } from './component-class';

const ComponentConstructor__symbol = (/*#__PURE__*/ Symbol('newComponent'));

type ComponentConstructor<T extends object> = (this: ComponentType<T>, context: ComponentContext<T>) => T;

interface ComponentType<T extends object> extends ComponentClass<T> {

  [ComponentConstructor__symbol]?: ComponentConstructor<T>;

}

/**
 * @internal
 */
export function newComponent<T extends object>(context: ComponentContext<T>): T {

  const componentType = context.componentType as ComponentType<T>;

  if (!componentType[ComponentConstructor__symbol]) {
    componentType[ComponentConstructor__symbol] = newComponentConstructor(componentType);
  }

  return componentType[ComponentConstructor__symbol]!(context);
}

function newComponentConstructor<T extends object>(componentType: ComponentType<T>): ComponentConstructor<T> {

  // Component context reference specific to component class.
  const context__symbol = Symbol('component-context');

  type ComponentInstance = T & {
    [context__symbol]?: ComponentContext<T>;
  };

  let defaultContext: ComponentContext<T> | undefined;

  componentType.prototype[ComponentContext__symbol] = function (
      this: ComponentInstance,
  ): ComponentContext<T> {
    return this[context__symbol] || (this[context__symbol] = defaultContext)!;
  };

  return function (this: ComponentType<T>, context: ComponentContext<T>): T {

    const prevContext = defaultContext;

    // Ensure the component context is available in component constructor.
    defaultContext = context;
    try {

      const component = new this(context) as ComponentInstance;

      component[context__symbol] = context;

      return component;
    } finally {
      defaultContext = prevContext;
    }
  };
}
