import { Class, ContextValueKey, EventProducer, SingleValueKey } from '../common';
import { ComponentContext, ComponentElementType, ComponentType, ComponentValueProvider } from '../component';
import { ElementClass } from '../element';
import { BootstrapValues } from './bootstrap-values';

/**
 * Web components bootstrap context.
 *
 * An instance of this class is passed to `FeatureDef.configure()` method so that the feature can configure itself.
 *
 * Extends `BootstrapValues` interface. The values are provided by corresponding bootstrap value providers provided
 * by features. I.e. configured in their definitions as `FeatureDef.provided`.
 */
export interface BootstrapContext extends BootstrapValues {

  /**
   * Registers web component definition listener.
   *
   * This listener will be called when new component class is defined, but before its element class created.
   *
   * @param listener A listener to notify on each web component definition.
   *
   * @return An event interest instance.
   */
  readonly onComponentDefinition: EventProducer<ComponentDefinitionListener>;

  /**
   * Registers custom HTML element definition listener.
   *
   * This listener will be called when new HTML element class is created, but before it is registered as custom element.
   *
   * @param listener A listener to notify on each custom HTML element definition.
   *
   * @return An event interest instance.
   */
  readonly onElementDefinition: EventProducer<ElementDefinitionListener>;

  /**
   * Registers custom HTML element instantiation listener.
   *
   * This listener will be called when new custom HTML instance created, but before its component instance is created.
   *
   * @param listener A listener to notify on each custom HTML element instance.
   *
   * @return An event interest instance.
   */
  readonly onElement: EventProducer<ElementListener>;

  /**
   * Defines a web component.
   *
   * Creates a custom HTML element according to component definition, and registers it with
   * `window.customElements.define()` method.
   *
   * Note that custom element registration will happen only after all features initialization.
   *
   * @param <T> A type of web component.
   * @param componentType Web component type.
   *
   * @return Custom HTML element class constructor registered as custom element.
   *
   * @throws TypeError if `componentType` does not contain a web component definition.
   */
  define<T extends object>(componentType: ComponentType<T>): void;

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
   * Registers provider that associates a value with the given key with component.
   *
   * The given provider will be requested for the value at most once per component.
   *
   * @param <S> The type of source value.
   * @param key Component context value key the provider should associate the value with.
   * @param provider Component context value provider to register.
   */
  forComponent<S>(key: ContextValueKey<any, S>, provider: ComponentValueProvider<S>): void;

}

/**
 * Web component definition listener.
 *
 * It is notified on new component definitions when registered with `BootstrapContext.onComponentDefinition()` method.
 *
 * The listener may alter the component class or even replace it with another one. For the latter it should return
 * the replacement class. Be careful however. If the replacement definition element name differs from original one,
 * then the original component can not be passed to `Components.whenDefined()` method, as the latter relies on element
 * name. Consider to use a `Component.of()` function in that case.
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
 * It is notified on new custom HTML element definitions when registered with `BootstrapContext.onElementDefinition()`
 * method.
 *
 * The listener may alter the custom HTML element class or even replace it with another one. For the latter it should
 * return the replacement class.
 *
 * @param elementType Custom HTML element class constructor.
 * @param componentType Web component type the HTML element is created for.
 *
 * @return Either none, or HTML element class constructor to use instead of `elementType`.
 */
export type ElementDefinitionListener = <T extends object>(
    elementType: ElementClass<ComponentElementType<T>>,
    componentType: ComponentType<T>) => ElementClass<ComponentElementType<T>> | void;

/**
 * Custom HTML element instantiation listener.
 *
 * It is notified on new custom HTML element instance creation when registered with `BootstrapContext.onElement()`
 * method.
 *
 * @param element Custom HTML element instance.
 * @param context Web component context.
 */
export type ElementListener = <T extends object>(
    element: ComponentElementType<T>,
    context: ComponentContext<T, ComponentElementType<T>>) => void;

export namespace BootstrapContext {

  /**
   * A key of context value containing a window instance the bootstrap is performed against.
   *
   * Target value defaults to current window.
   */
  export const windowKey = new SingleValueKey<Window>('window', () => window);

  /**
   * A key of context value containing a base HTML element class constructor.
   *
   * This value is the class the custom HTML elements are inherited from unless `ComponentDef.extends.type`
   * is specified.
   *
   * Target value defaults to `HTMLElement` from the window provided under `windowKey`.
   */
  export const baseElementKey = new SingleValueKey<Class<HTMLElement>>(
      'base-element',
      values => (values.get(windowKey) as any).HTMLElement);

  /**
   * A key of context value containing a `CustomElementRegistry` instance used to register custom elements.
   *
   * Target value defaults to `window.customElements` from the window provided under `windowKey`.
   */
  export const customElementsKey = new SingleValueKey<CustomElementRegistry>(
      'custom-elements',
      values => values.get(windowKey).customElements);

}
