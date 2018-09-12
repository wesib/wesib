import { Class, ContextValueKey, EventProducer, SingleValueKey } from '../common';
import {
  ComponentClass,
  ComponentListener,
  ComponentValueProvider,
  DefinitionListener,
  DefinitionValueProvider,
} from '../component';
import { BootstrapValues } from './bootstrap-values';

/**
 * Components bootstrap context.
 *
 * An instance of this class is passed to `FeatureDef.configure()` method so that the feature can configure itself.
 *
 * Extends `BootstrapValues` interface. The values are provided by corresponding bootstrap value providers provided
 * by features. I.e. configured in their definitions as `FeatureDef.bootstraps`.
 */
export interface BootstrapContext extends BootstrapValues {

  /**
   * Registers component definition listener.
   *
   * This listener will be called when new component class is defined, but before its custom element class constructed.
   *
   * @param listener A listener to notify on each component definition.
   *
   * @return An event interest instance.
   */
  readonly onDefinition: EventProducer<DefinitionListener>;

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
   * Registers provider that associates a value with the given key with component types.
   *
   * The given provider will be requested for the value at most once per component.
   *
   * @param <S> The type of source value.
   * @param key Component definition context value key the provider should associate the value with.
   * @param provider Component definition context value provider to register.
   */
  forDefinitions<S>(key: ContextValueKey<any, S>, provider: DefinitionValueProvider<S>): void;

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

export namespace BootstrapContext {

  /**
   * A key of context value containing a window instance the bootstrap is performed against.
   *
   * Target value defaults to current window.
   */
  export const windowKey = new SingleValueKey<Window>('window', () => window);

  /**
   * A key of context value containing a `CustomElementRegistry` instance used to register custom elements.
   *
   * Target value defaults to `window.customElements` from the window provided under `windowKey`.
   */
  export const customElementsKey = new SingleValueKey<CustomElementRegistry>(
      'custom-elements',
      values => values.get(windowKey).customElements);

}
