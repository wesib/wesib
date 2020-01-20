/**
 * @module @wesib/wesib
 */
import { nextArgs, nextSkip } from 'call-thru';
import { AfterEvent, afterEventBy, OnEvent, trackValue } from 'fun-events';
import { newNamespaceAliaser } from 'namespace-aliaser';
import { Class } from '../../common';
import { ComponentClass, ComponentFactory, CustomElements } from '../../component/definition';
import { FeatureDef, FeatureRef, FeatureStatus } from '../../feature';
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

/**
 * @internal
 */
function bootstrapFeature(needs: Class[]): Class {
  return FeatureDef.define(class BootstrapFeature {}, { needs });
}

/**
 * @internal
 */
const enum BootstrapStage {
  Init,
  Ready,
}

/**
 * @internal
 */
function initBootstrap(
    bootstrapContextRegistry: BootstrapContextRegistry,
): {
  bootstrapContext: BootstrapContext;
  complete(): void;
} {

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

    async whenDefined<C extends object>(componentType: ComponentClass<C>): Promise<ComponentFactory<C>> {
      await new Promise(resolve => this.whenReady(resolve));
      await this.get(CustomElements).whenDefined(componentType);
      return componentFactoryOf(componentType);
    }

    load(feature: Class<any>): FeatureRef {

      interface FeatureInfo {
        status: FeatureStatus;
        down?: Promise<void>;
      }

      const status = afterEventBy<[FeatureInfo]>(receiver => {

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const request = bootstrapContext.get(FeatureRequester).request(feature);
        const info = trackValue<FeatureInfo>({
          status: {
            feature,
            ready: false,
          },
        });

        this.get(FeatureKey.of(feature))({
          supply: receiver.supply,
          receive(_ctx, ldr) {

            // Present until `request` revoked
            // But that happens only when supply is cut off.
            const loader = ldr as FeatureLoader;

            info.it = {
              status: {
                feature: loader.request.feature,
                ready: loader.ready,
              },
              down: loader.down,
            };
            if (!loader.ready) {
              loader.init().then(() => {
                info.it = {
                  status: {
                    feature: loader.request.feature,
                    ready: true,
                  },
                  down: loader.down,
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

      let whenDown: Promise<void>;
      const supply = status(({ down }) => {
        whenDown = down!;
      });
      const read: AfterEvent<[FeatureStatus]> = status.keep.thru(
          info => info.status,
      ).tillOff(supply);

      class Ref extends FeatureRef {

        get read(): AfterEvent<[FeatureStatus]> {
          return read;
        }

        get down(): Promise<void> {
          return whenDown;
        }

        dismiss(reason?: any): Promise<void> {
          supply.off(reason);
          return whenDown;
        }

      }

      return new Ref();
    }

  }

  const bootstrapContext = new Context();

  return {
    bootstrapContext,
    complete(): void {
      stage.it = BootstrapStage.Ready;
    },
  };
}
