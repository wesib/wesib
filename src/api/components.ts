import { ComponentElementType, ComponentType } from '../component';
import { ElementClass } from '../element';
import { ComponentRegistry } from '../element/component-registry';

/**
 * Web components definition API.
 *
 * It is typically available as `components` constant. But it also can be constructed with `createComponents()` function
 * when needs to be customized.
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

}

/**
 * Web components definition API options.
 *
 * This can be passed to `createComponents()` method in order to customize the API.
 */
export interface ComponentsOpts {

  /**
   * A window instance custom components are registered for.
   *
   * This instance is used to access `window.customElements` and HTML element classes.
   *
   * Current window instance is used if when this option is omitted.
   */
  window?: Window;
}

/**
 * Creates a new, customized instance of web components definition API.
 *
 * @param opts Custom API options.
 *
 * @return New web components definition API instance customized in accordance to the given options.
 */
export function createComponents(opts: ComponentsOpts = {}): Components {

  const registry = ComponentRegistry.create({ window: opts.window });

  return {
    define(componentType) {
      return registry.define(componentType);
    },
    whenDefined(componentType) {
      return registry.whenDefined(componentType);
    }
  };
}

/**
 * Default web components definition API instance.
 *
 * This should be normally used to define web components, unless non-standard options required.
 */
export const components = createComponents();
