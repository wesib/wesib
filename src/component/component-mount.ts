/**
 * @module @wesib/wesib
 */
import { ComponentContext } from './component-context';

/**
 * A mount of the component to an element.
 *
 * This is constructed when a component is mounted to arbitrary element by [[ComponentFactory.mountTo]] method.
 *
 * Mounted components do not maintain their connection status automatically. It is a calling code responsibility to set
 * their connection status by updating [[ComponentMount.connected]] property. E.g. by periodically calling a
 * [[ComponentMount.checkConnected]] method, or by using an [[AutoConnectSupport]] feature.
 *
 * @category Core
 * @typeparam T  A type of component.
 */
export abstract class ComponentMount<T extends object = any> {

  /**
   * Mounted component context.
   */
  abstract readonly context: ComponentContext<T>;

  /**
   * Component connection state.
   *
   * Updating this property triggers appropriate listeners registered in [[ComponentContext]].
   *
   * The initial state is set by [[checkConnected]] method.
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

  /**
   * Checks whether the mounted component element is actually connected to its owning document.
   *
   * Updates the `connected` property and returns its value.
   *
   * @returns `true` if the component element is connected, or `false` otherwise.
   */
  abstract checkConnected(): boolean;

}
