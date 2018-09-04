import { ComponentContext } from './component-context';
import { ComponentElementType, ComponentType } from './component-type';

export namespace Component {

  /**
   * A key of custom HTML element property holding a reference to web component instance.
   */
  export const symbol = Symbol('web-component');

  /**
   * Extracts a reference to the web component from custom HTML element
   *
   * @param <T> A type of web component.
   * @param element Target HTML element instance.
   *
   * @return Either a web component reference stored under `[Component.symbol]` key, or `undefined` if the given
   * `element` is not a custom element constructed for the web component.
   */
  export function of<T extends object>(element: HTMLElement): T | undefined {
    return (element as any)[symbol];
  }

  /**
   * Creates new web component of the given type.
   *
   * It makes component context available under `[ComponentContext.symbol]` key in constructed component.
   * The component context is also available inside component constructor by temporarily assigning it to component
   * prototype.
   *
   * @param <T> A type of web component.
   * @param type Web component type.
   * @param context Web component context.
   */
  export function create<T extends object>(
      type: ComponentType<T>,
      context: ComponentContext<T, ComponentElementType<T>>): T {

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
