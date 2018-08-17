import { ComponentRegistry } from '../element/component-registry';
import { Components } from './components';

/**
 * Web components definition API configuration.
 *
 * This can be passed to `createComponents()` method in order to customize the API.
 */
export interface ComponentsConfig {

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
 * Bootstraps web components definition API.
 *
 * @param config Custom configuration.
 *
 * @return New web components definition API instance customized in accordance to the given configuration.
 */
export function bootstrapComponents(config: ComponentsConfig = {}): Components {

  const registry = ComponentRegistry.create({ window: config.window });

  return {
    define(componentType) {
      return registry.define(componentType);
    },
    whenDefined(componentType) {
      return registry.whenDefined(componentType);
    }
  };
}
