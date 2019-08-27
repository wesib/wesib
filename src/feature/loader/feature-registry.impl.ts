/**
 * @module @wesib/wesib
 */
import { itsFirst } from 'a-iterable';
import { ContextRegistry } from 'context-values';
import { BootstrapContext } from '../../boot';
import { BootstrapValueRegistry } from '../../boot/bootstrap/bootstrap-value-registry.impl';
import { ComponentRegistry } from '../../boot/definition/component-registry.impl';
import { ArraySet, Class } from '../../common';
import { ComponentClass } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { FeatureDef } from '../feature-def';

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
      dependencies: Set<Class> = new Set(),
  ): Class {
    if (dependencies.has(this.feature)) {
      throw Error(
          'Circular dependency: '
          + [...dependencies.values()].map(feature => feature.name).join(' -> ')
          + ` -> ${this.feature.name}`,
      );
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
          new Set([...dependencies, this.feature]),
      );

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

    return itsFirst(this.providers.values()) as Class;
  }

}

/**
 * @internal
 */
export class FeatureRegistry {

  private readonly _providers = new Map<Class, FeatureProviders>();
  private readonly _valueRegistry: BootstrapValueRegistry;
  private readonly _componentRegistry: ComponentRegistry;

  static create(opts: {
    valueRegistry: BootstrapValueRegistry,
    componentRegistry: ComponentRegistry,
  }): FeatureRegistry {
    return new FeatureRegistry(opts);
  }

  private constructor(
      {
        valueRegistry,
        componentRegistry,
      }: {
        valueRegistry: BootstrapValueRegistry;
        componentRegistry: ComponentRegistry;
      }) {
    this._valueRegistry = valueRegistry;
    this._componentRegistry = componentRegistry;
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
    new ArraySet(def.needs).items.forEach(needed => this.add(needed));

    if (!existing) {
      this._providers.set(feature, providers);
    }

    // Add provided features after the feature itself.
    new ArraySet(def.has).items.forEach(provided => this.add(provided, feature));
  }

  bootstrap(context: BootstrapContext) {
    this._provideValues(context);
    this._initFeatures(context);
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

  private _initFeatures(bsContext: BootstrapContext) {
    this._providers.forEach((providers, feature) => {
      if (feature === providers.provider(this._providers)) {

        const init = FeatureDef.of(feature).init;

        if (init) {
          init.call(feature, this._featureContext(bsContext));
        }
      }
    });
  }

  private _featureContext(bsContext: BootstrapContext): FeatureContext {

    const componentRegistry = this._componentRegistry;
    const registry = new ContextRegistry<FeatureContext>(bsContext);
    const values = registry.newValues();

    class Context extends FeatureContext {

      constructor() {
        super();
        registry.provide({ a: FeatureContext, is: this });
      }

      get get() {
        return values.get;
      }

      define<T extends object>(componentType: ComponentClass<T>): void {
        componentRegistry.define(componentType);
      }

    }

    return new Context();
  }

}
