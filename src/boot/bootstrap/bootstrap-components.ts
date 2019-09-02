/**
 * @module @wesib/wesib
 */
import { nextArgs, nextSkip } from 'call-thru';
import { AfterEvent, afterEventBy, trackValue } from 'fun-events';
import { newNamespaceAliaser } from 'namespace-aliaser';
import { Class } from '../../common';
import { ComponentClass } from '../../component/definition';
import { FeatureDef, LoadedFeature } from '../../feature';
import { FeatureKey, FeatureLoader, FeatureRequester } from '../../feature/loader';
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

  const bootstrapRegistry = BootstrapValueRegistry.create();
  const { bootstrapContext, complete } = initBootstrap(bootstrapRegistry);
  const feature = features.length === 1 ? features[0] : bootstrapFeature(features);

  bootstrapContext.get(FeatureRequester).request(feature);
  bootstrapContext.get(FeatureKey.of(feature))(loader => {
    loader!.init().then(complete);
  });

  return bootstrapContext;
}

function bootstrapFeature(needs: Class[]): Class {
  return FeatureDef.define(class BootstrapFeature {}, { needs });
}

function initBootstrap(bootstrapRegistry: BootstrapValueRegistry) {

  const stage = trackValue<BootstrapStage>(BootstrapStage.Init);
  const whenReady = stage.read.thru(s => s ? nextArgs() : nextSkip());
  const values = bootstrapRegistry.values;

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
      bootstrapRegistry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
      bootstrapRegistry.provide({ a: BootstrapContext, is: this });
    }

    async whenDefined<C extends object>(componentType: ComponentClass<C>) {
      await new Promise(resolve => this.whenReady(resolve));
      return this.get(ComponentRegistry).whenDefined(componentType);
    }

    whenReady(callback: (this: void) => void): void {
      whenReady.once(callback);
    }

    load(feature: Class<any>): AfterEvent<[LoadedFeature]> {
      return afterEventBy<[LoadedFeature]>(receiver => {

        const request = bootstrapContext.get(FeatureRequester).request(feature);
        const info = trackValue<LoadedFeature>({
          feature,
          ready: false,
        });

        const interest = this.get(FeatureKey.of(feature))(ldr => {

          // Present until `request` revoked
          // But that happens only when interest is lost.
          const loader = ldr as FeatureLoader;

          info.it = {
            feature: loader.request.feature,
            ready: loader.isReady,
          };
          if (!loader.isReady) {
            loader.init().then(() => {
              info.it = {
                feature: loader.request.feature,
                ready: true,
              };
            });
          }
        }).whenDone(() => request.unuse());

        info.read(receiver).needs(interest);

        return interest;
      }).share();
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
