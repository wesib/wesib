import { ComponentContext } from './component-context';

/**
 * A mount of the component to an element.
 *
 * This is constructed when a component is mounted to arbitrary element by `ComponentFactory.mountTo()` method.
 *
 * Mounted components do not maintain their connection status automatically. It is a calling code responsibility to set
 * their connection status by updating `ComponentMount.connected` property.
 */
export abstract class ComponentMount<T extends object = object> {

  /**
   * Mounted component context.
   */
  abstract readonly context: ComponentContext<T>;

  /**
   * Component connection state.
   *
   * Updating this property triggers appropriate listeners registered in `ComponentContext`.
   */
  abstract connected: boolean;

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
