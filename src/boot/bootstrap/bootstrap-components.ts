/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { nextArgs, nextSkip } from '@proc7ts/call-thru';
import { AfterEvent, afterEventBy, EventReceiver, EventSupply, OnEvent, trackValue } from '@proc7ts/fun-events';
import { newNamespaceAliaser } from '@proc7ts/namespace-aliaser';
import { Class } from '../../common';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { FeatureDef, FeatureRef, FeatureStatus } from '../../feature';
import { FeatureKey, FeatureLoader, FeatureRequester } from '../../feature/loader';
import { BootstrapContext } from '../bootstrap-context';
import { DefaultNamespaceAliaser } from '../globals';
import { BootstrapContextRegistry } from '../impl';
import { whenDefined } from '../impl/when-defined.impl';

/**
 * Bootstraps components.
 *
 * Both features and components can be passed as parameters to this function.
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
  bootstrapContext.get(FeatureKey.of(feature)).to(loader => {
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

  class BootstrapContext$ extends BootstrapContext {

    readonly get = values.get;

    constructor() {
      super();
      bootstrapContextRegistry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
      bootstrapContextRegistry.provide({ a: BootstrapContext, is: this });
    }

    whenDefined<C extends object>(componentType: ComponentClass<C>): OnEvent<[DefinitionContext<C>]> {
      return whenDefined(this, componentType);
    }

    whenReady(): OnEvent<[BootstrapContext]>;
    whenReady(receiver: EventReceiver<[BootstrapContext]>): EventSupply;
    whenReady(receiver?: EventReceiver<[BootstrapContext]>): OnEvent<[BootstrapContext]> | EventSupply {
      return (this.whenReady = stage.read().thru(
          s => s ? nextArgs(this) : nextSkip(),
      ).once().F)(receiver);
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

        this.get(FeatureKey.of(feature)).to({
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
      const supply = status.to(({ down }) => {
        whenDown = down!;
      });

      class Ref extends FeatureRef {

        get down(): Promise<void> {
          return whenDown;
        }

        read(): AfterEvent<[FeatureStatus]>;
        read(receiver: EventReceiver<[FeatureStatus]>): EventSupply;
        read(receiver?: EventReceiver<[FeatureStatus]>): AfterEvent<[FeatureStatus]> | EventSupply {
          return (this.read = status.tillOff(supply).keepThru(
              info => info.status,
          ).F)(receiver);
        }

        dismiss(reason?: any): Promise<void> {
          supply.off(reason);
          return whenDown;
        }

      }

      return new Ref();
    }

  }

  const bootstrapContext = new BootstrapContext$();

  return {
    bootstrapContext,
    complete(): void {
      stage.it = BootstrapStage.Ready;
    },
  };
}
