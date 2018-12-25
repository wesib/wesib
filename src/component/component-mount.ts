import { ComponentContext } from './component-context';

/**
 * A mount of the component to an element.
 *
 * This is constructed when a component is mounted to arbitrary element by `ComponentFactory.mountTo()` method.
 */
export abstract class ComponentMount<T extends object = object> {

  /**
   * Mounted component context.
   */
  abstract readonly context: ComponentContext<T>;

  /**
   * Mounted component.
   */
  get component(): T {
    return this.context.component;
  }

  /**
   * An element the component is mounted to.
   */
  get element(): any {
    return this.context.element;
  }

}
