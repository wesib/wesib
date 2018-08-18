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
   * Registers web component definition listener.
   *
   * This listener will be called when new component is defined, but before its element created.
   *
   * @param listener A listener to notify on each web component definition.
   *
   * @return A disposable instance that unregisters the listener when disposed.
   */
  onComponentDefinition(listener: ComponentDefinitionListener): Disposable;

  /**
   * Registers custom HTML element definition listener.
   *
   * This listener will be called when new HTML element class is create, bu before it is registered as custom element.
   *
   *
   * @param listener A listener to notify on each custom HTML element definition.
   *
   * @return A disposable instance that unregisters the listener when disposed.
   */
  onElementDefinition(listener: ElementDefinitionListener): Disposable;

}

/**
 * Web component definition listener.
 *
 * It is notified on new component definitions when registered with `Components.onComponentDefinition()` method.
 *
 * The listener may alter the component class or even replace it with another one. For the latter it should return
 * the replacement class. Be careful however. If the replacement definition element name differs from original one,
 * then the original component can not be passed to `Components.whenDefined()` method, as the latter relies on element
 * name. Consider to use a `componentOf()` function in that case.
 *
 * @param componentType Web component class constructor.
 *
 * @returns Either none, or web component class constructor to use instead of `componentType`.
 */
export type ComponentDefinitionListener = <T extends object>(
    componentType: ComponentType<T>) => ComponentType<T> | void;

/**
 * Element definition listener.
 *
 * It is notified on new custom HTML element definitions when registered with `Components.onElementDefinition()` method.
 *
 * The listener may alter the custom HTML element class or even replace it with another one. For the latter it should
 * return the replacement class.
 *
 * @param elementType Custom HTML element class constructor.
 * @param componentType Web component type the HTML element is created for.
 *
 * @return Either none, or HTML element class constructor to use instead of `elementType`.
 */
export type ElementDefinitionListener = <T extends object, HTE extends HTMLElement>(
    elementType: ElementClass<HTE>,
    componentType: ComponentType<T, HTE>) => ElementClass<HTE> | void;
