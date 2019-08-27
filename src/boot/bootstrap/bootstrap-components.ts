/**
 * @module @wesib/wesib
 */
import { nextArgs, nextSkip } from 'call-thru';
import { trackValue } from 'fun-events';
import { newNamespaceAliaser } from 'namespace-aliaser';
import { Class } from '../../common';
import { ComponentClass } from '../../component/definition';
import { FeatureRegistry } from '../../feature/loader';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentRegistry } from '../definition/component-registry.impl';
import { ComponentValueRegistry } from '../definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../definition/definition-value-registry.impl';
import { ElementBuilder } from '../definition/element-builder.impl';
import { DefaultNamespaceAliaser } from '../globals';
import { BootstrapValueRegistry } from './bootstrap-value-registry.impl';

/**
 * Bootstraps components.
 *
 * Note that both features and components can be passed as parameters to this function, as components are features too.
 *
 * @category Core
 * @param features  Features and components to enable.
 *
 * @returns Bootstrap context instance.
 */
export function bootstrapComponents(...features: Class[]): BootstrapContext {

  const valueRegistry = BootstrapValueRegistry.create();
  const values = valueRegistry.values;
  const definitionValueRegistry = DefinitionValueRegistry.create(values);
  const componentValueRegistry = ComponentValueRegistry.create();
  const elementBuilder = ElementBuilder.create({ definitionValueRegistry, componentValueRegistry });
  const { bootstrapContext, componentRegistry, complete } = initBootstrap({ elementBuilder, valueRegistry });
  const featureRegistry = FeatureRegistry.create({
    bootstrapContext,
    componentRegistry,
    valueRegistry,
    definitionValueRegistry,
    componentValueRegistry,
  });

  features.forEach(feature => featureRegistry.add(feature));
  featureRegistry.bootstrap().then(complete);

  return bootstrapContext;
}

function initBootstrap(
    {
      elementBuilder,
      valueRegistry,
    }: {
      elementBuilder: ElementBuilder;
      valueRegistry: BootstrapValueRegistry;
    },
) {

  let componentRegistry!: ComponentRegistry;
  const stage = trackValue<BootstrapStage>(BootstrapStage.Init);
  const whenReady = stage.read.thru(s => s ? nextArgs() : nextSkip());

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
      valueRegistry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
      valueRegistry.provide({ a: Context, is: this });
      componentRegistry = ComponentRegistry.create({ bootstrapContext: this, elementBuilder });
      this.whenReady(() => componentRegistry.complete());
    }

    whenDefined<C extends object>(componentType: ComponentClass<C>) {
      return componentRegistry.whenDefined(componentType);
    }

    whenReady(callback: (this: this) => void): void {
      whenReady.once(() => callback.call(this));
    }

  }

  const bootstrapContext = new Context();

  return {
    bootstrapContext,
    componentRegistry,
    complete() {
      stage.it = BootstrapStage.Ready;
    },
  };
}

const enum BootstrapStage {
  Init,
  Ready,
}
