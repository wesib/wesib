import { ContextModule } from '@proc7ts/context-values/updatable';
import { Class, setOfElements, valueProvider } from '@proc7ts/primitives';
import { ComponentDef, ComponentDef__symbol } from '../../component';
import { FeatureDef } from '../feature-def';
import { BootstrapWorkbench, featureInitStage, featureSetupStage } from './bootstrap-workbench.impl';
import { FeatureContext$ } from './feature-context.impl';

const FeatureModule__symbol = (/*#__PURE__*/ Symbol('feature-module'));

interface FeatureClass extends Class {

  [FeatureModule__symbol]?: FeatureModule;

}

/**
 * @internal
 */
export class FeatureModule extends ContextModule {

  static of(feature: FeatureClass): FeatureModule {
    if (Object.prototype.hasOwnProperty.call(feature, FeatureModule__symbol)) {
      return feature[FeatureModule__symbol]!;
    }
    return feature[FeatureModule__symbol] = new FeatureModule(feature);
  }

  constructor(readonly feature: Class) {
    super(feature.name, FeatureModule$options(feature));
  }

  async setup(setup: ContextModule.Setup): Promise<void> {

    const workbench = setup.get(BootstrapWorkbench);

    await workbench.work(featureSetupStage).run(() => super.setup(setup));
  }

}

function FeatureModule$options(feature: Class): ContextModule.Options {

  const def = featureDef(feature);
  const has: FeatureModule[] = [];
  const needs: FeatureModule[] = [];

  for (const replaced of setOfElements(def.has)) {
    has.push(FeatureModule.of(replaced));
  }
  for (const required of setOfElements(def.needs)) {
    needs.push(FeatureModule.of(required));
  }

  return {
    needs,
    has,
    setup(setup) {

      const workbench = setup.get(BootstrapWorkbench);
      const featureContext = new FeatureContext$(feature, setup);

      if (def.init) {

        const whenInit = workbench.work(featureInitStage).run(() => {
          def.init!(featureContext);
        });

        setup.initBy(valueProvider(whenInit));
      }

      def.setup?.(featureContext);
    },
  };
}

function featureDef(featureType: Class): FeatureDef.Options {

  let def = FeatureDef.of(featureType);

  if (ComponentDef__symbol in featureType) {
    def = FeatureDef.merge(
        def,
        {
          init(context) {
            context.define(featureType);
          },
        },
    );

    const { feature } = ComponentDef.of(featureType);

    if (feature) {
      def = FeatureDef.merge(def, feature);
    }

  }

  return def;
}
