import { list2set } from '../util';
import { BootstrapContext } from './bootstrap-context';
import { FeatureDef, FeatureType } from './feature';

/**
 * @internal
 */
export class FeatureRegistry {

  readonly _features = new Map<FeatureType, FeatureType>();

  static create(): FeatureRegistry {
    return new FeatureRegistry();
  }

  private constructor() {
  }

  add(feature: FeatureType, provider: FeatureType = feature) {

    const existing = this._features.get(feature);

    if (existing) {
      // The feature is provided already
      provider = selectProvider(feature, existing, provider);
      if (existing === provider) {
        return; // ...by the same provider. No need to register it again.
      }
    }

    this._features.set(feature, provider);

    const def = FeatureDef.of(feature);

    list2set(def.requires).forEach(required => this.add(required));
    list2set(def.provides).forEach(provided => this.add(provided, feature));
  }

  configure(context: BootstrapContext) {
    this._features.forEach((provider, feature) => {
      if (feature === provider) {

        const configure = FeatureDef.of(feature).configure;

        if (configure) {
          configure.call(feature, context);
        }
      }
    });
  }

}

function selectProvider(feature: FeatureType, provider1: FeatureType, provider2: FeatureType): FeatureType {
  // The feature itself as its own provider has lower precedence that any other one.
  if (provider2 === feature) {
    return provider1;
  }
  if (provider1 === feature) {
    return provider2;
  }
  if (provider1 !== provider2) {
    throw Error(`${feature.name} is provided by both ${provider1.name} and ${provider2.name}`);
  }
  return provider1;
}
