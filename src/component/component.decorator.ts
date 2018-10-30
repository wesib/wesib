import { TypedClassDecorator } from '../common';
import { ComponentClass } from './component';
import { ComponentContext } from './component-context';
import { ComponentDef } from './component-def';

/**
 * Component class decorator.
 *
 * Decorate a class with this decorator to define a component like this:
 * ```TypeScript
 * @Component({ name: 'my-element' })
 * class MyComponent {
 *   // ...
 * }
 * ```
 *
 * Such component can be registered with `BootstrapContext.define()` method, or used as a feature, e.g. passed to
 * `bootstrapComponents()` method, or added to `FeatureDef.require` property of another feature.
 *
 * This is an alternative to direct call to `ComponentDef.define()` method.
 *
 * @param <T> A type of component.
 * @param <E> A type of custom element this component extends.
 * @param def A component definition or just custom element name.
 *
 * @returns A component class decorator.
 */
export function Component<T extends ComponentClass = any>(
    def: ComponentDef<InstanceType<T>> | string):
    TypedClassDecorator<T> {
  return (type: T) => ComponentDef.define(type, typeof def === 'string' ? { name: def } : def);
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
