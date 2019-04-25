import { ArraySet, Class } from '../common';
import { BootstrapContext } from '../kit';
import { BootstrapValueRegistry } from '../kit/bootstrap/bootstrap-value-registry';
import { FeatureDef } from './feature-def';

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
    new ArraySet(def.need).items.forEach(needed => this.add(needed));

    if (!existing) {
      this._providers.set(feature, providers);
    }

    // Add provided features after the feature itself.
    new ArraySet(def.has).items.forEach(provided => this.add(provided, feature));
  }

  bootstrap(context: BootstrapContext) {
    this._provideValues(context);
    this._bootstrapFeatures(context);
  }

  private _provideValues(context: BootstrapContext) {
    this._providers.forEach((providers, feature) => {
      if (feature === providers.provider(this._providers)) {

        const def = FeatureDef.of(feature);

        new ArraySet(def.set).forEach(spec => this._valueRegistry.provide(spec));
        new ArraySet(def.perDefinition).forEach(spec => context.perDefinition(spec));
        new ArraySet(def.perComponent).forEach(spec => context.perComponent(spec));
      }
    });
  }

  private _bootstrapFeatures(context: BootstrapContext) {
    this._providers.forEach((providers, feature) => {
      if (feature === providers.provider(this._providers)) {

        const bootstrap = FeatureDef.of(feature).init;

        if (bootstrap) {
          bootstrap.call(feature, context);
        }
      }
    });
  }

}
