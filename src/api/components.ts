import { ComponentElementType, ComponentType } from '../component';
import { ElementClass } from '../element';
import { Disposable } from '../types';

/**
 * Web components definition API.
 *
 * An instance of the API can be constructed with `createComponents()` function.
 */
export interface Components {

  /**
   * Defines a web component.
   *
   * Creates a custom HTML element according to component definition, and registers it with
   * `window.customElements.define()` method.
   *
   * @param <T> A type of web component.
   * @param componentType Web component type.
   *
   * @return Custom HTML element class constructor registered as custom element.
   *
   * @throws TypeError if `componentType` does not contain a web component definition.
   */
  define<T extends object>(componentType: ComponentType<T>): ElementClass<ComponentElementType<T>>;

  /**
   * Allows to wait for web component definition complete.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentType Web component type.
   *
   * @return A promise that is resolved when the given componentType is registered.
   *
   * @throws TypeError if `componentType` does not contain a web component definition.
   */
  whenDefined(componentType: ComponentType<any, any>): PromiseLike<void>;

  /**
   * Registers component definition listener.
   *
   * This listener will be called when new component is defined, but before its element created.
   *
   * @param listener A listener to notify on each component definition.
   *
   * @return A disposable instance that unregisters the given listener when disposed.
   */
  onComponentDefinition(listener: ComponentDefinitionListener): Disposable;

}

/**
 * Component definition listener.
 *
 * It is notified on new components definition when registered with `Components.onComponentDefinition()` method.
 *
 * The listener may alter the component class or even replace it with another one. For the latter it should return
 * the replacement class. Be careful however. If the replacement definition element name differs from original one,
 * then the original component can not be passed to `Components.whenDefined()` method, as the latter relies on element
 * name. Consider to use a `componentOf()` function in that case.
 *
 * @param componentType Component class constructor.
 *
 * @returns Either none, or component class constructor to use instead of `componentType`.
 */
export type ComponentDefinitionListener =
    <T extends object>(componentType: ComponentType<T>) => ComponentType<T> | void;
