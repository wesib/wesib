import { ComponentElementType, ComponentType, ComponentValueKey, ComponentValueProvider } from '../component';
import { ElementClass } from '../element';
import { ComponentRegistry } from '../element/component-registry';
import { ElementBuilder } from '../element/element-builder';
import { ProviderRegistry } from '../element/provider-registry';
import { Disposable } from '../types';
import {
  BootstrapContext,
  ComponentDefinitionListener,
  ElementDefinitionListener,
  ElementListener,
} from './bootstrap-context';
import { FeatureType } from './feature';
import { FeatureSet } from './feature-set';

/**
 * Web components bootstrap configuration.
 *
 * This can be passed to `bootstrapComponents()` function in order to customize the API.
 */
export interface BootstrapConfig {

  /**
   * A window instance custom components are registered for.
   *
   * This instance is used to access `window.customElements` and HTML element classes.
   *
   * Current window instance is used if when this option is omitted.
   */
  window?: Window;

}

export function bootstrapComponents(...features: FeatureType[]): void;

export function bootstrapComponents(config: BootstrapConfig, ...features: FeatureType[]): void;

/**
 * Bootstraps web components definition API.
 *
 * @param config Custom bootstrap configuration.
 * @param features Web components features to enable.
 *
 * @return New web components definition API instance customized in accordance to the given configuration.
 */
export function bootstrapComponents(config?: BootstrapConfig | FeatureType, ...features: FeatureType[]) {
  if (!config) {
    config = {};
  } else if (typeof config === 'function') {
    features = [ config, ...features ];
    config = {};
  }

  const featureSet = FeatureSet.create();

  features.forEach(feature => featureSet.add(feature));

  const { componentRegistry, bootstrapContext } = initBootstrap(config);

  featureSet.configure(bootstrapContext);

  componentRegistry.complete();
}

function initBootstrap(config: BootstrapConfig) {

  const providerRegistry = ProviderRegistry.create();
  const elementBuilder = ElementBuilder.create({ window: config.window, providerRegistry });
  const componentRegistry = ComponentRegistry.create({ builder: elementBuilder });

  class Context implements BootstrapContext {

    define<T extends object>(componentType: ComponentType<T>): ElementClass<ComponentElementType<T>> {
      return componentRegistry.define(componentType);
    }

    whenDefined(componentType: ComponentType<any, any>): PromiseLike<void> {
      return componentRegistry.whenDefined(componentType);
    }

    provide<V>(key: ComponentValueKey<V>, provider: ComponentValueProvider<V>): void {
      providerRegistry.provide(key, provider);
    }

    onComponentDefinition(listener: ComponentDefinitionListener): Disposable {
      return componentRegistry.onComponentDefinition(listener);
    }

    onElementDefinition(listener: ElementDefinitionListener): Disposable {
      return componentRegistry.onElementDefinition(listener);
    }

    onElement(listener: ElementListener): Disposable {
      return elementBuilder.onElement(listener);
    }

  }

  return { componentRegistry, bootstrapContext: new Context() };
}
