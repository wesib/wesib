import { CxModule } from '@proc7ts/context-modules';
import { CxEntry, CxRequest } from '@proc7ts/context-values';
import {
  AfterEvent,
  AfterEvent__symbol,
  onceOn,
  OnEvent,
  trackValue,
  valueOn,
  valueOn_,
} from '@proc7ts/fun-events';
import { Class, valueProvider } from '@proc7ts/primitives';
import { SupplyPeer } from '@proc7ts/supply';
import { BootstrapContext } from './boot';
import { ComponentClass, DefinitionContext } from './component/definition';
import { FeatureDef, FeatureRef, FeatureStatus } from './feature';
import { FeatureModule } from './feature/loader';
import { BootstrapContextBuilder } from './impl';
import { whenDefined } from './impl/when-defined';

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
  const { bsContext, complete } = initBootstrap();
  const feature = features.length === 1 ? features[0] : bootstrapFeature(features);

  bsContext
    .load(feature)
    .read.do(
      valueOn_(({ ready }) => ready),
      onceOn,
    )
    .then(complete)
    .catch(console.error);

  return bsContext;
}

function bootstrapFeature(needs: Class[]): Class {
  return FeatureDef.define(class BootstrapFeature {}, { needs });
}

const enum BootstrapStage {
  Init,
  Ready,
}

function initBootstrap(): {
  bsContext: BootstrapContext;
  complete(): void;
} {
  const stage = trackValue<BootstrapStage>(BootstrapStage.Init);
  const bsBuilder = new BootstrapContextBuilder(getValue => {
    class BootstrapContext$ implements BootstrapContext {

      readonly whenReady: OnEvent<[BootstrapContext]>;

      constructor() {
        this.whenReady = stage.read.do(
          valueOn(bsStage => !!bsStage && this),
          onceOn,
        );
      }

      get<TValue>(
        entry: CxEntry<TValue, unknown>,
        request?: CxRequest.WithoutFallback<TValue>,
      ): TValue;
      get<TValue>(entry: CxEntry<TValue, unknown>, request: CxRequest.WithFallback<TValue>): TValue;
      get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null;
      get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null {
        return getValue(entry, request);
      }

      whenDefined<T extends object>(
        componentType: ComponentClass<T>,
      ): OnEvent<[DefinitionContext<T>]> {
        return whenDefined(this, componentType);
      }

      load(feature: Class, user?: SupplyPeer): FeatureRef {
        const module = FeatureModule.of(feature);
        const supply = bsBuilder.provide(module);

        if (user) {
          supply.needs(user);
        } else {
          user = supply;
        }

        const use = this.get(module).use(user);
        const read = FeatureRef$read(feature, use);

        return {
          read,
          whenReady: read.do(
            valueOn_(status => status.ready && status),
            onceOn,
          ),
          [AfterEvent__symbol]: valueProvider(read),
          supply,
        };
      }

}

    return new BootstrapContext$();
  });

  const bsContext = bsBuilder.context;

  return {
    bsContext,
    complete(): void {
      stage.it = BootstrapStage.Ready;
    },
  };
}

function FeatureRef$read(feature: Class, use: CxModule.Use): AfterEvent<[FeatureStatus]> {
  const status = trackValue<FeatureStatus>({ feature, ready: false });

  use
    .read(({ module, ready }) => {
      const feature = (module as FeatureModule).feature;
      const lastStatus = status.it;

      if (!lastStatus || lastStatus.feature !== feature || lastStatus.ready !== ready) {
        status.it = {
          feature,
          ready,
        };
      }
    })
    .needs(use);
  status.supply.needs(use);

  return status.read;
}
