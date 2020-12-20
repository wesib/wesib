/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  AfterEvent,
  afterEventBy,
  mapAfter,
  onceOn,
  OnEvent,
  shareAfter,
  supplyAfter,
  trackValue,
  valueOn,
} from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
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
 * @param features - Features and components to enable.
 *
 * @returns Bootstrap context instance.
 */
export function bootstrapComponents(...features: Class[]): BootstrapContext {

  const bootstrapContextRegistry = BootstrapContextRegistry.create();
  const { bootstrapContext, complete } = initBootstrap(bootstrapContextRegistry);
  const feature = features.length === 1 ? features[0] : bootstrapFeature(features);

  bootstrapContext.get(FeatureRequester).request(feature);
  bootstrapContext.get(FeatureKey.of(feature))(loader => {
    loader!.init().then(complete).catch(console.error);
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

    readonly whenReady: OnEvent<[BootstrapContext]>;
    readonly get = values.get;

    constructor() {
      super();
      this.whenReady = stage.read.do(
          valueOn(bsStage => !!bsStage && this),
          onceOn,
      );
      bootstrapContextRegistry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
      bootstrapContextRegistry.provide({ a: BootstrapContext, is: this });
    }

    whenDefined<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionContext<T>]> {
      return whenDefined(this, componentType);
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
              }).catch(console.error);
            }
          },
        }).whenOff(() => {
          request.unuse(); // Apply this callback _after_ registration complete,
                           // to prevent receiver call.
        });

        info.read(receiver);
      }).do(shareAfter);

      let whenDown: Promise<void>;
      const supply = status(({ down }) => {
        whenDown = down!;
      });

      class Ref extends FeatureRef {

        readonly read: AfterEvent<[FeatureStatus]> = status.do(
            supplyAfter(supply),
            mapAfter(({ status }) => status),
        );

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

  const bootstrapContext = new BootstrapContext$();

  return {
    bootstrapContext,
    complete(): void {
      stage.it = BootstrapStage.Ready;
    },
  };
}
