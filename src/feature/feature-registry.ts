import { list2set } from '../util';
import { BootstrapContext } from './bootstrap-context';
import { FeatureDef, FeatureType } from './feature';

class FeatureProviders {

  readonly providers = new Set<FeatureType>();

  constructor(readonly feature: FeatureType) {
    this.add(feature);
  }

  add(provider: FeatureType) {
    this.providers.add(provider);
  }

  provider(
      allProviders: Map<FeatureType, FeatureProviders>,
      dependencies: Set<FeatureType> = new Set()): FeatureType {
    if (dependencies.has(this.feature)) {
      throw Error(
          'Circular dependency: '
          + [...dependencies.values()].map(feature => feature.name).join(' -> ')
          + ` -> ${this.feature.name}`);
    }

    if (this.providers.size > 1) {
      // Remove self if there are other providers
      this.providers.delete(this.feature);
    } else if (this.providers.has(this.feature)) {
      return this.feature; // The feature is provided only by itself.
    }

    // Replace providers that in turn provided by others
    this.providers.forEach(provider => {

      const transientProviders = allProviders.get(provider);

      if (!transientProviders) {
        return;
      }

      const transientProvider = transientProviders.provider(
          allProviders,
          new Set([...dependencies, this.feature]));

      if (transientProvider === provider) {
        return;
      }
      this.providers.delete(provider);
      this.providers.add(transientProvider);
    });

    if (this.providers.size !== 1) {
      throw Error(
          `Feature \`${this.feature.name}\` is provided by multiple providers: `
          + [...this.providers.values()].map(feature => feature.name).join(', '));
    }

    return [...this.providers.values()][0];
  }

}

/**
 * @internal
 */
export class FeatureRegistry {

  readonly _providers = new Map<FeatureType, FeatureProviders>();

  static create(): FeatureRegistry {
    return new FeatureRegistry();
  }

  private constructor() {
  }

  add(feature: FeatureType, provider: FeatureType = feature) {

    let providers = this._providers.get(feature);

    if (!providers) {
      providers = new FeatureProviders(feature);
      this._providers.set(feature, providers);
    }
    providers.add(provider);

    const def = FeatureDef.of(feature);

    list2set(def.requires).forEach(required => this.add(required));
    list2set(def.provides).forEach(provided => this.add(provided, feature));
  }

  configure(context: BootstrapContext) {
    this._providers.forEach((providers, feature) => {
      if (feature === providers.provider(this._providers)) {

        const configure = FeatureDef.of(feature).configure;

        if (configure) {
          configure.call(feature, context);
        }
      }
    });
  }

}
