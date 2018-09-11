import { ContextValueKey, EventProducer } from './common';
import { ComponentType, ComponentValueProvider } from './component';
import { ComponentRegistry } from './element/component-registry';
import { ComponentValueRegistry } from './element/component-value-registry';
import { ElementBuilder } from './element/element-builder';
import {
  BootstrapContext,
  ComponentDefinitionListener,
  ElementDefinitionListener,
  ComponentListener,
  FeatureType,
} from './feature';
import { BootstrapValueRegistry } from './feature/bootstrap-value-registry';
import { FeatureRegistry } from './feature/feature-registry';

/**
 * Bootstraps web components.
 *
 * Note that both features and components can be passed as parameters to this function, as components are features too.
 * Components would be defined only when all features enabled.
 *
 * @param features Features and components to enable.
 */
export function bootstrapComponents(...features: FeatureType[]): void {

  const valueRegistry = BootstrapValueRegistry.create();
  const featureRegistry = FeatureRegistry.create({ valueRegistry });

  features.forEach(feature => featureRegistry.add(feature));

  const { componentRegistry, bootstrapContext } = initBootstrap(valueRegistry);

  featureRegistry.configure(bootstrapContext);

  componentRegistry.complete();
}

function initBootstrap(valueRegistry: BootstrapValueRegistry) {

  let componentValueRegistry: ComponentValueRegistry;
  let elementBuilder: ElementBuilder;
  let componentRegistry: ComponentRegistry;

  class Context implements BootstrapContext {

    readonly onComponentDefinition: EventProducer<ComponentDefinitionListener>;
    readonly onElementDefinition: EventProducer<ElementDefinitionListener>;
    readonly onComponent: EventProducer<ComponentListener>;
    readonly get = valueRegistry.values.get;

    constructor() {
      componentValueRegistry = ComponentValueRegistry.create(valueRegistry.bindSources(this));
      elementBuilder = ElementBuilder.create({ bootstrapContext: this, valueRegistry: componentValueRegistry });
      componentRegistry = ComponentRegistry.create({ builder: elementBuilder });
      this.onComponentDefinition = componentRegistry.componentDefinitions.on;
      this.onElementDefinition = componentRegistry.elementDefinitions.on;
      this.onComponent = elementBuilder.elements.on;
    }

    define<T extends object>(componentType: ComponentType<T>) {
      componentRegistry.define(componentType);
    }

    whenDefined(componentType: ComponentType<any, any>): PromiseLike<void> {
      return componentRegistry.whenDefined(componentType);
    }

    forComponent<S>(key: ContextValueKey<any, S>, provider: ComponentValueProvider<S>): void {
      componentValueRegistry.provide(key, provider);
    }

  }

  const bootstrapContext = new Context();

  return {
    // @ts-ignore
    componentRegistry,
    bootstrapContext,
  };
}
