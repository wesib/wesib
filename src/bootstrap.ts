import { EventProducer } from 'fun-events';
import { Class, ContextValueSpec } from './common';
import {
  ComponentClass,
  ComponentContext,
  ComponentListener,
  DefinitionContext,
  DefinitionListener,
} from './component';
import { ComponentRegistry } from './component/definition/component-registry';
import { ComponentValueRegistry } from './component/definition/component-value-registry';
import { DefinitionValueRegistry } from './component/definition/definition-value-registry';
import { ElementBuilder } from './component/definition/element-builder';
import { BootstrapContext as BootstrapContext_ } from './feature';
import { BootstrapValueRegistry } from './feature/bootstrap-value-registry';
import { FeatureRegistry } from './feature/feature-registry';

/**
 * Bootstraps components.
 *
 * Note that both features and components can be passed as parameters to this function, as components are features too.
 *
 * @param features Features and components to enable.
 */
export function bootstrapComponents(...features: Class[]): void {

  const valueRegistry = BootstrapValueRegistry.create();
  const featureRegistry = FeatureRegistry.create({ valueRegistry });

  features.forEach(feature => featureRegistry.add(feature));

  const { componentRegistry, bootstrapContext } = initBootstrap(valueRegistry);

  featureRegistry.bootstrap(bootstrapContext);

  componentRegistry.complete();
}

function initBootstrap(valueRegistry: BootstrapValueRegistry) {

  let definitionValueRegistry: DefinitionValueRegistry;
  let componentValueRegistry: ComponentValueRegistry;
  let elementBuilder: ElementBuilder;
  let componentRegistry: ComponentRegistry;

  class BootstrapContext extends BootstrapContext_ {

    readonly onDefinition: EventProducer<DefinitionListener>;
    readonly onComponent: EventProducer<ComponentListener>;
    readonly get = valueRegistry.values.get;

    constructor() {
      super();
      definitionValueRegistry = DefinitionValueRegistry.create(valueRegistry.valueSources);
      componentValueRegistry = ComponentValueRegistry.create();
      elementBuilder = ElementBuilder.create({ definitionValueRegistry, componentValueRegistry });
      componentRegistry = ComponentRegistry.create({ bootstrapContext: this, elementBuilder });
      this.onDefinition = elementBuilder.definitions.on;
      this.onComponent = elementBuilder.components.on;
    }

    define<T extends object>(componentType: ComponentClass<T>) {
      componentRegistry.define(componentType);
    }

    whenDefined(componentType: ComponentClass<any>): PromiseLike<void> {
      return componentRegistry.whenDefined(componentType);
    }

    forDefinitions<S>(spec: ContextValueSpec<DefinitionContext<any>, any, S>): void {
      definitionValueRegistry.provide(spec);
    }

    forComponents<S>(spec: ContextValueSpec<ComponentContext<any>, any, S>): void {
      componentValueRegistry.provide(spec);
    }

  }

  const bootstrapContext = new BootstrapContext();

  return {
    // @ts-ignore
    componentRegistry,
    bootstrapContext,
  };
}
