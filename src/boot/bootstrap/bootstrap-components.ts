import { newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { ContextModule } from '@proc7ts/context-values/updatable';
import { AfterEvent, AfterEvent__symbol, onceOn, OnEvent, trackValue, valueOn, valueOn_ } from '@proc7ts/fun-events';
import { Class, valueProvider } from '@proc7ts/primitives';
import { SupplyPeer } from '@proc7ts/supply';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { FeatureDef, FeatureRef, FeatureStatus } from '../../feature';
import { FeatureModule } from '../../feature/loader';
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

  bootstrapContext.load(feature)
      .read
      .do(
          valueOn_(({ ready }) => ready),
          onceOn,
      )
      .then(complete)
      .catch(console.error);

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

    load(feature: Class, user?: SupplyPeer): FeatureRef {

      const module = FeatureModule.of(feature);
      const supply = bootstrapContextRegistry.provide(module);

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

  const bootstrapContext = new BootstrapContext$();

  return {
    bootstrapContext,
    complete(): void {
      stage.it = BootstrapStage.Ready;
    },
  };
}

function FeatureRef$read(
    feature: Class,
    use: ContextModule.Use,
): AfterEvent<[FeatureStatus]> {

  const status = trackValue<FeatureStatus>({ feature, ready: false });

  use.read(({ module, ready }) => {

    const feature = (module as FeatureModule).feature;
    const lastStatus = status.it;

    if (!lastStatus || lastStatus.feature !== feature || lastStatus.ready !== ready) {
      status.it = {
        feature,
        ready,
      };
    }
  }).needs(use);
  status.supply.needs(use);

  return status.read;
}
