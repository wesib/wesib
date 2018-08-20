import { ComponentValueKey, ComponentValueProvider } from '../component';
import { ComponentRegistry } from '../element/component-registry';
import { ElementBuilder } from '../element/element-builder';
import { ProviderRegistry } from '../element/provider-registry';
import { Components } from './components';

declare module './components' {

  export namespace Components {

    /**
     * Web components definition API configuration.
     *
     * This can be passed to `Components.bootstrap()` method in order to customize the API.
     */
    export interface Config {

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
    export function bootstrap(config?: Config): Components;

  }

}

Components.bootstrap = function bootstrap(config: Components.Config = {}): Components {

  const providerRegistry = ProviderRegistry.create();
  const elementBuilder = ElementBuilder.create({ window: config.window, providerRegistry });
  const componentRegistry = ComponentRegistry.create({ builder: elementBuilder });

  return {
    define(componentType) {
      return componentRegistry.define(componentType);
    },
    whenDefined(componentType) {
      return componentRegistry.whenDefined(componentType);
    },
    provide<V>(key: ComponentValueKey<V>, provider: ComponentValueProvider<V>): void {
      providerRegistry.provide(key, provider);
    },
    onComponentDefinition(listener) {
      return componentRegistry.onComponentDefinition(listener);
    },
    onElementDefinition(listener) {
      return componentRegistry.onElementDefinition(listener);
    },
    onElement(listener) {
      return elementBuilder.onElement(listener);
    }
  };
};
