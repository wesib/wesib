/**
 * @module @wesib/wesib
 */
import { noop } from 'call-thru';
import { ContextValueSpec } from 'context-values';
import { newNamespaceAliaser } from 'namespace-aliaser';
import { Class } from '../../common';
import { ComponentClass, ComponentContext } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { FeatureRegistry } from '../../feature/feature-registry.impl';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentKit } from '../component-kit';
import { DefaultNamespaceAliaser } from '../default-namespace-aliaser';
import { ComponentRegistry } from '../definition/component-registry.impl';
import { ComponentValueRegistry } from '../definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../definition/definition-value-registry.impl';
import { ElementBuilder } from '../definition/element-builder.impl';
import { BootstrapValueRegistry } from './bootstrap-value-registry.impl';

/**
 * Bootstraps components.
 *
 * Note that both features and components can be passed as parameters to this function, as components are features too.
 *
 * @category Core
 * @param features  Features and components to enable.
 *
 * @returns New component kit instance.
 */
export function bootstrapComponents(...features: Class[]): ComponentKit {

  const valueRegistry = BootstrapValueRegistry.create();
  const featureRegistry = FeatureRegistry.create({ valueRegistry });

  features.forEach(feature => featureRegistry.add(feature));

  const { bootstrapContext, complete } = initBootstrap(valueRegistry);

  featureRegistry.bootstrap(bootstrapContext);
  complete();

  return bootstrapContext.get(ComponentKit);
}

function initBootstrap(valueRegistry: BootstrapValueRegistry) {

  let definitionValueRegistry: DefinitionValueRegistry;
  let componentValueRegistry: ComponentValueRegistry;
  let elementBuilder: ElementBuilder;
  let componentRegistry: ComponentRegistry;
  let whenReady: (this: BootstrapContext) => void = noop;
  let ready = false;

  class Kit extends ComponentKit {

    whenDefined<C extends object>(componentType: ComponentClass<C>) {
      return componentRegistry.whenDefined(componentType);
    }

  }

  const values = valueRegistry.values;

  class Context extends BootstrapContext {

    get onDefinition() {
      return elementBuilder.definitions.on;
    }

    get onComponent() {
      return elementBuilder.components.on;
    }

    get get() {
      return values.get;
    }

    constructor() {
      super();
      definitionValueRegistry = DefinitionValueRegistry.create(values);
      componentValueRegistry = ComponentValueRegistry.create();
      elementBuilder = ElementBuilder.create({ definitionValueRegistry, componentValueRegistry });
      componentRegistry = ComponentRegistry.create({ bootstrapContext: this, elementBuilder });
      valueRegistry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
      valueRegistry.provide({ a: Context, is: this });
      valueRegistry.provide({ a: ComponentKit, as: Kit });
    }

    define<T extends object>(componentType: ComponentClass<T>) {
      componentRegistry.define(componentType);
    }

    perDefinition<D extends any[], S>(spec: ContextValueSpec<DefinitionContext, any, D, S>) {
      definitionValueRegistry.provide(spec);
    }

    perComponent<D extends any[], S>(spec: ContextValueSpec<ComponentContext, any, D, S>) {
      componentValueRegistry.provide(spec);
    }

    whenReady(callback: (this: BootstrapContext) => void): void {
      if (ready) {
        callback.call(this);
      } else {

        const prev = whenReady;

        whenReady = function () {
          prev.call(this);
          callback.call(this);
        };
      }
    }

  }

  const bootstrapContext = new Context();

  return {
    bootstrapContext,
    complete() {
      componentRegistry.complete();
      ready = true;
      whenReady.call(bootstrapContext);
    },
  };
}
