import { Class, ContextValueKey, EventProducer, SingleValueKey } from '../common';
import { ComponentClass, ComponentContext, ComponentValueProvider } from '../component';
import { BootstrapValues } from './bootstrap-values';

/**
 * Components bootstrap context.
 *
 * An instance of this class is passed to `FeatureDef.configure()` method so that the feature can configure itself.
 *
 * Extends `BootstrapValues` interface. The values are provided by corresponding bootstrap value providers provided
 * by features. I.e. configured in their definitions as `FeatureDef.provided`.
 */
export interface BootstrapContext extends BootstrapValues {

  /**
   * Registers component definition listener.
   *
   * This listener will be called when new component class is defined, but before its element class created.
   *
   * @param listener A listener to notify on each component definition.
   *
   * @return An event interest instance.
   */
  readonly onComponentDefinition: EventProducer<ComponentDefinitionListener>;

  /**
   * Registers custom element definition listener.
   *
   * This listener will be called when new element class is created, but before it is registered as custom element.
   *
   * @param listener A listener to notify on each custom element definition.
   *
   * @return An event interest instance.
   */
  readonly onElementDefinition: EventProducer<ElementDefinitionListener>;

  /**
   * Registers component construction listener.
   *
   * This listener will be called right before component is constructed.
   *
   * @param listener A listener to notify on each component construction.
   *
   * @return An event interest instance.
   */
  readonly onComponent: EventProducer<ComponentListener>;

  /**
   * Defines a component.
   *
   * Creates a custom element according to component definition, and registers it with custom elements registry.
   *
   * Note that custom element definition will happen only when all features configuration complete.
   *
   * @param <T> A type of component.
   * @param componentType Component class constructor.
   *
   * @return Custom element class constructor registered as custom element.
   *
   * @throws TypeError If `componentType` does not contain a component definition.
   */
  define<T extends object>(componentType: ComponentClass<T>): void;

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentType Component class constructor.
   *
   * @return A promise that is resolved when the given `componentType` is registered.
   *
   * @throws TypeError If `componentType` does not contain a component definition.
   */
  whenDefined(componentType: ComponentClass<any>): PromiseLike<void>;

  /**
   * Registers provider that associates a value with the given key with components.
   *
   * The given provider will be requested for the value at most once per component.
   *
   * @param <S> The type of source value.
   * @param key Component context value key the provider should associate the value with.
   * @param provider Component context value provider to register.
   */
  forComponents<S>(key: ContextValueKey<any, S>, provider: ComponentValueProvider<S>): void;

}

/**
 * Component definition listener.
 *
 * It is notified on new component definitions when registered with `BootstrapContext.onComponentDefinition()` method.
 *
 * The listener may alter the component class or even replace it with another one. For the latter it should return
 * the replacement class. Be careful however. If the replacement definition element name differs from original one,
 * then the original component can not be passed to `Components.whenDefined()` method, as the latter relies on element
 * name. Consider to use a `Component.of()` function in that case.
 *
 * @param componentType Component class constructor.
 *
 * @returns Either none, or component class constructor to use instead of `componentType`.
 */
export type ComponentDefinitionListener = <T extends object>(
    componentType: ComponentClass<T>) => ComponentClass<T> | void;

/**
 * Element definition listener.
 *
 * It is notified on new custom element definitions when registered with `BootstrapContext.onElementDefinition()`
 * method.
 *
 * The listener may alter the custom element class or even replace it with another one. For the latter it should
 * return the replacement class.
 *
 * @param elementType Custom element class constructor.
 * @param componentType Component class constructor the element is created for.
 *
 * @return Either none, or element class constructor to use instead of `elementType`.
 */
export type ElementDefinitionListener = <T extends object>(
    elementType: Class,
    componentType: ComponentClass<T>) => Class | void;

/**
 * Component construction listener.
 *
 * It is notified on new component instance construction when registered with `BootstrapContext.onComponent()`
 * method.
 *
 * @param context Component context.
 */
export type ComponentListener = <T extends object>(context: ComponentContext<T>) => void;

export namespace BootstrapContext {

  /**
   * A key of context value containing a window instance the bootstrap is performed against.
   *
   * Target value defaults to current window.
   */
  export const windowKey = new SingleValueKey<Window>('window', () => window);

  /**
   * A key of context value containing a base element class constructor.
   *
   * This value is the class the custom elements are inherited from unless `ComponentDef.extends.type` is specified.
   *
   * Target value defaults to `HTMLElement` from the window provided under `windowKey`.
   */
  export const baseElementKey = new SingleValueKey<Class>(
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
