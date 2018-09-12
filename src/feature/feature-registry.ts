import { Class } from '../common';
import { list2array, list2set } from '../util';
import { BootstrapContext } from './bootstrap-context';
import { BootstrapValueRegistry } from './bootstrap-value-registry';
import { FeatureDef } from './feature';

class FeatureProviders {

  readonly providers = new Set<Class>();

  constructor(readonly feature: Class) {
    this.add(feature);
  }

  add(provider: Class) {
    this.providers.add(provider);
  }

  provider(
      allProviders: Map<Class, FeatureProviders>,
      dependencies: Set<Class> = new Set()): Class {
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

  private readonly _providers = new Map<Class, FeatureProviders>();
  private readonly _valueRegistry: BootstrapValueRegistry;

  static create(opts: { valueRegistry: BootstrapValueRegistry }): FeatureRegistry {
    return new FeatureRegistry(opts);
  }

  private constructor(
      {
        valueRegistry,
      }: {
        valueRegistry: BootstrapValueRegistry;
      }) {
    this._valueRegistry = valueRegistry;
  }

  add(feature: Class, provider: Class = feature) {

    const existing = this._providers.get(feature);
    let providers = existing;

    if (!providers) {
      providers = new FeatureProviders(feature);
    }
    providers.add(provider);

    const def = FeatureDef.of(feature);

    // Add requirements before the feature itself.
    list2set(def.requires).forEach(required => this.add(required));

    if (!existing) {
      this._providers.set(feature, providers);
    }

    // Add provided features after the feature itself.
    list2set(def.provides).forEach(provided => {
      this.add(provided, feature);
    });
  }

  configure(context: BootstrapContext) {
    this._provideValues();
    this._configureFeatures(context);
  }

  private _provideValues() {
    this._providers.forEach((providers, feature) => {
      if (feature === providers.provider(this._providers)) {
        list2array(FeatureDef.of(feature).bootstraps).forEach(provided => {
          this._valueRegistry.provide(provided.key, provided.provider);
        });
      }
    });
  }

  private _configureFeatures(context: BootstrapContext) {
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
