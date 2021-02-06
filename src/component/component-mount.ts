import { ComponentContext } from './component-context';

/**
 * A mount of the component to an element.
 *
 * This is constructed when a component is mounted to arbitrary element by {@link DefinitionContext.mountTo} method.
 *
 * Mounted components do not maintain their connection state automatically. It is a calling code responsibility to set
 * their connection state by updating {@link ComponentMount.connected} property. E.g. by calling a
 * {@link ComponentMount.checkConnected} method. An {@link ElementObserver} and {@link AutoConnectSupport} feature
 * could be used to do it automatically.
 *
 * @category Core
 * @typeParam T - A type of component.
 */
export abstract class ComponentMount<T extends object = any> {

  /**
   * Mounted component context.
   */
  abstract readonly context: ComponentContext<T>;

  /**
   * Component connection state.
   *
   * The initial state is set by {@link checkConnected} method.
   */
  abstract readonly connected: boolean;

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
    return this.context.element as unknown;
  }

  /**
   * Forcibly connects mounted component element to the document.
   */
  abstract connect(): void;

  /**
   * Checks whether the mounted component element is actually connected to its owning document.
   *
   * Updates the `connected` property and returns its value.
   *
   * When component is disconnected after it has been connected, the component is {@link ComponentContext.destroy
   * destroyed}.
   *
   * @returns `true` if the component element is connected, or `false` otherwise.
   */
  abstract checkConnected(): boolean;

}
