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
  const { bootstrapContext, complete } = initBootstrap(valueRegistry);
  const featureRegistry = FeatureRegistry.create(bootstrapContext);

  features.forEach(feature => featureRegistry.add(feature));
  featureRegistry.bootstrap().then(complete);

  return bootstrapContext;
}

function initBootstrap(valueRegistry: BootstrapValueRegistry) {

  const stage = trackValue<BootstrapStage>(BootstrapStage.Init);
  const whenReady = stage.read.thru(s => s ? nextArgs() : nextSkip());
  const values = valueRegistry.values;

  class Context extends BootstrapContext {

    get onDefinition() {
      return this.get(ElementBuilder).definitions.on;
    }

    get onComponent() {
      return this.get(ElementBuilder).components.on;
    }

    get get() {
      return values.get;
    }

    constructor() {
      super();
      valueRegistry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
      valueRegistry.provide({ a: BootstrapContext, is: this });
      this.whenReady(() => this.get(ComponentRegistry).complete());
    }

    whenDefined<C extends object>(componentType: ComponentClass<C>) {
      return this.get(ComponentRegistry).whenDefined(componentType);
    }

    whenReady(callback: (this: void) => void): void {
      whenReady.once(callback);
    }

  }

  const bootstrapContext = new Context();

  return {
    bootstrapContext,
    complete() {
      stage.it = BootstrapStage.Ready;
    },
  };
}

const enum BootstrapStage {
  Init,
  Ready,
}
