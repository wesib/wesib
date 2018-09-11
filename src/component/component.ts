import { ComponentContext } from './component-context';

/**
 * Component class constructor.
 *
 * Constructor may accept a component context instance as the only parameter.
 *
 * @param <T> A type of component.
 */
export interface ComponentClass<T extends object = object> extends Function {
  new (context: ComponentContext<T>): T;
  prototype: T;
}

export namespace Component {

  /**
   * A key of custom element property holding a reference to component instance.
   */
  export const symbol = Symbol('component');

  /**
   * Extracts a reference to component from custom element.
   *
   * @param <T> A type of component.
   * @param element Target custom element instance.
   *
   * @return Either a component reference stored under `[Component.symbol]` key, or `undefined` if the given
   * `element` is not a custom element constructed for a component.
   */
  export function of<T extends object>(element: any): T | undefined {
    return (element as any)[symbol];
  }

  /**
   * Creates new component of the given type.
   *
   * It makes component context available under `[ComponentContext.symbol]` key in constructed component.
   * The component context is also available inside component constructor by temporarily assigning it to component
   * prototype.
   *
   * @param <T> A type of component.
   * @param type Component class constructor.
   * @param context Target component context.
   */
  export function create<T extends object>(type: ComponentClass<T>, context: ComponentContext<T>): T {

    const proto = type.prototype as any;
    const prevContext = proto[ComponentContext.symbol];

    proto[ComponentContext.symbol] = context;
    try {

      const component = new type(context);

      Object.defineProperty(component, ComponentContext.symbol, { value: context });

      return component;
    } finally {
      proto[ComponentContext.symbol] = prevContext;
    }
  }

}
