import { CxModule } from '@proc7ts/context-modules';
import { Class, hasOwnProperty, setOfElements, valueProvider } from '@proc7ts/primitives';
import { ComponentDef, ComponentDef__symbol } from '../../component';
import { FeatureDef } from '../feature-def';
import { BootstrapWorkbench, featureInitStage, featureSetupStage } from './bootstrap-workbench.impl';
import { FeatureContext$ } from './feature-context.impl';

const FeatureModule__symbol = (/*#__PURE__*/ Symbol('FeatureModule'));

interface FeatureClass extends Class {

  [FeatureModule__symbol]?: FeatureModule | undefined;

}

export class FeatureModule extends CxModule {

  static of(feature: FeatureClass): FeatureModule {
    if (hasOwnProperty(feature, FeatureModule__symbol)) {
      return feature[FeatureModule__symbol]!;
    }
    return feature[FeatureModule__symbol] = new FeatureModule(feature);
  }

  private constructor(readonly feature: Class) {
    super(feature.name, FeatureModule$options(feature));
  }

  override async setup(setup: CxModule.Setup): Promise<void> {

    const workbench = setup.get(BootstrapWorkbench);

    await workbench.work(featureSetupStage).run(() => super.setup(setup));
  }

  override toString(): string {
    return `[Feature ${this.name}]`;
  }

}

function FeatureModule$options(feature: Class): CxModule.Options {

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
    async setup(setup) {

      const workbench = setup.get(BootstrapWorkbench);
      const featureContext = FeatureContext$.create(feature, setup);

      if (def.init) {

        const whenInit = workbench.work(featureInitStage).run(async () => {
          await def.init!(featureContext);
        });

        setup.initBy(valueProvider(whenInit));
      }

      await def.setup?.(featureContext);
    },
  };
}

function featureDef(featureType: Class): FeatureDef {

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
