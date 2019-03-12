import { noop } from 'call-thru';
import { ContextValueSpec } from 'context-values';
import { Class } from '../../common';
import { ComponentClass, ComponentContext } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { FeatureRegistry } from '../../feature/feature-registry';
import { BootstrapContext as BootstrapContext_ } from '../bootstrap-context';
import { ComponentKit as ComponentKit_ } from '../component-kit';
import { ComponentRegistry } from '../definition/component-registry';
import { ComponentValueRegistry } from '../definition/component-value-registry';
import { DefinitionValueRegistry } from '../definition/definition-value-registry';
import { ElementBuilder } from '../definition/element-builder';
import { BootstrapValueRegistry } from './bootstrap-value-registry';

/**
 * Bootstraps components.
 *
 * Note that both features and components can be passed as parameters to this function, as components are features too.
 *
 * @param features Features and components to enable.
 *
 * @returns New component kit instance.
 */
export function bootstrapComponents(...features: Class[]): ComponentKit_ {

  const valueRegistry = BootstrapValueRegistry.create();
  const featureRegistry = FeatureRegistry.create({ valueRegistry });

  features.forEach(feature => featureRegistry.add(feature));

  const { bootstrapContext, complete } = initBootstrap(valueRegistry);

  featureRegistry.bootstrap(bootstrapContext);
  complete();

  return bootstrapContext.get(ComponentKit_);
}

function initBootstrap(valueRegistry: BootstrapValueRegistry) {

  let definitionValueRegistry: DefinitionValueRegistry;
  let componentValueRegistry: ComponentValueRegistry;
  let elementBuilder: ElementBuilder;
  let componentRegistry: ComponentRegistry;
  let whenReady: (this: BootstrapContext_) => void = noop;
  let ready = false;

  class ComponentKit extends ComponentKit_ {

    whenDefined<C extends object>(componentType: ComponentClass<C>) {
      return componentRegistry.whenDefined(componentType);
    }

  }

  const values = valueRegistry.values;

  class BootstrapContext extends BootstrapContext_ {

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
      valueRegistry.provide({ a: BootstrapContext, is: this });
      valueRegistry.provide({ a: ComponentKit_, as: ComponentKit });
    }

    define<T extends object>(componentType: ComponentClass<T>) {
      componentRegistry.define(componentType);
    }

    forDefinitions<D extends any[], S>(spec: ContextValueSpec<DefinitionContext<any>, any, D, S>) {
      definitionValueRegistry.provide(spec);
    }

    forComponents<D extends any[], S>(spec: ContextValueSpec<ComponentContext<any>, any, D, S>) {
      componentValueRegistry.provide(spec);
    }

    whenReady(callback: (this: BootstrapContext_) => void): void {
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

  const bootstrapContext = new BootstrapContext();

  return {
    bootstrapContext,
    complete() {
      componentRegistry.complete();
      ready = true;
      whenReady.call(bootstrapContext);
    },
  };
}
