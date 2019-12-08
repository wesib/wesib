/**
 * @module @wesib/wesib
 */
import { nextArgs, nextSkip } from 'call-thru';
import { AfterEvent, afterEventBy, OnEvent, trackValue } from 'fun-events';
import { newNamespaceAliaser } from 'namespace-aliaser';
import { Class } from '../../common';
import { ComponentClass, CustomElements } from '../../component/definition';
import { FeatureDef, LoadedFeature } from '../../feature';
import { FeatureKey, FeatureLoader, FeatureRequester } from '../../feature/loader';
import { BootstrapContext } from '../bootstrap-context';
import { DefaultNamespaceAliaser } from '../globals';
import { BootstrapContextRegistry } from '../impl';
import { componentFactoryOf } from '../impl/component-factory.symbol.impl';

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

  const bootstrapContextRegistry = BootstrapContextRegistry.create();
  const { bootstrapContext, complete } = initBootstrap(bootstrapContextRegistry);
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

function initBootstrap(bootstrapContextRegistry: BootstrapContextRegistry) {

  const stage = trackValue<BootstrapStage>(BootstrapStage.Init);
  const values = bootstrapContextRegistry.values;

  class Context extends BootstrapContext {

    readonly get = values.get;
    readonly whenReady: OnEvent<[BootstrapContext]>;

    constructor() {
      super();

      const whenReady: OnEvent<[BootstrapContext]> = stage.read.thru(
          s => s ? nextArgs(this) : nextSkip(),
      );

      this.whenReady = whenReady.once;
      bootstrapContextRegistry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
      bootstrapContextRegistry.provide({ a: BootstrapContext, is: this });
    }

    async whenDefined<C extends object>(componentType: ComponentClass<C>) {
      await new Promise(resolve => this.whenReady(resolve));
      await this.get(CustomElements).whenDefined(componentType);
      return componentFactoryOf(componentType);
    }

    load(feature: Class<any>): AfterEvent<[LoadedFeature]> {
      return afterEventBy<[LoadedFeature]>(receiver => {

        const request = bootstrapContext.get(FeatureRequester).request(feature);
        const info = trackValue<LoadedFeature>({
          feature,
          ready: false,
        });

        this.get(FeatureKey.of(feature))({
          supply: receiver.supply,
          receive(_ctx, ldr) {

            // Present until `request` revoked
            // But that happens only when supply is cut off.
            const loader = ldr as FeatureLoader;

            info.it = {
              feature: loader.request.feature,
              ready: loader.ready,
            };
            if (!loader.ready) {
              loader.init().then(() => {
                info.it = {
                  feature: loader.request.feature,
                  ready: true,
                };
              });
            }
          },
        }).whenOff(() => {
          request.unuse(); // Apply this callback _after_ registration complete,
                           // to prevent receiver call.
        });

        info.read(receiver);
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
