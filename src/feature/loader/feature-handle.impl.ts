import { itsFirst } from 'a-iterable';
import { ContextRegistry, ContextValueSpec } from 'context-values';
import { ArraySet, Class } from '../../common';
import { ComponentContext } from '../../component';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { FeatureDef } from '../feature-def';
import { FeatureLoaderDeps } from './feature-loader-deps.impl';

/**
 * @internal
 */
export class FeatureHandle {

  private readonly _providers = new Set<Class>();
  private _context?: FeatureContext;

  constructor(readonly feature: Class, private readonly _deps: FeatureLoaderDeps) {
    this.provideBy(feature);
  }

  get context(): FeatureContext {
    if (this._context) {
      return this._context;
    }

    const { componentRegistry, definitionValueRegistry, componentValueRegistry } = this._deps;
    const registry = new ContextRegistry<FeatureContext>(this._deps.bootstrapContext);
    const values = registry.newValues();

    class Context extends FeatureContext {

      constructor() {
        super();
        registry.provide({ a: FeatureContext, is: this });
      }

      get get() {
        return values.get;
      }

      perDefinition<D extends any[], S>(spec: ContextValueSpec<DefinitionContext, any, D, S>) {
        definitionValueRegistry.provide(spec);
      }

      perComponent<D extends any[], S>(spec: ContextValueSpec<ComponentContext, any, D, S>) {
        componentValueRegistry.provide(spec);
      }

      define<T extends object>(componentType: ComponentClass<T>): void {
        componentRegistry.define(componentType);
      }

    }

    return this._context = new Context();
  }

  provideBy(provider: Class) {
    this._providers.add(provider);
  }

  provider(
      allProviders: Map<Class, FeatureHandle>,
      dependencies: Set<Class> = new Set(),
  ): Class {
    if (dependencies.has(this.feature)) {
      throw Error(
          'Circular dependency: '
          + [...dependencies.values()].map(feature => feature.name).join(' -> ')
          + ` -> ${this.feature.name}`,
      );
    }

    if (this._providers.size > 1) {
      // Remove self if there are other providers
      this._providers.delete(this.feature);
    } else if (this._providers.has(this.feature)) {
      return this.feature; // The feature is provided only by itself.
    }

    // Replace providers that in turn provided by others
    this._providers.forEach(provider => {

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
      this._providers.delete(provider);
      this._providers.add(transientProvider);
    });

    if (this._providers.size !== 1) {
      throw Error(
          `Feature \`${this.feature.name}\` is provided by multiple providers: `
          + [...this._providers.values()].map(feature => feature.name).join(', '));
    }

    return itsFirst(this._providers.values()) as Class;
  }

  provideValues(feature: Class) {

    const def = FeatureDef.of(feature);
    const context = this.context;

    new ArraySet(def.set).forEach(spec => this._deps.valueRegistry.provide(spec));
    new ArraySet(def.perDefinition).forEach(spec => context.perDefinition(spec));
    new ArraySet(def.perComponent).forEach(spec => context.perComponent(spec));
  }

  init(feature: Class) {

    const init = FeatureDef.of(feature).init;

    if (init) {
      init.call(feature, this.context);
    }
  }

}
