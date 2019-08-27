/**
 * @module @wesib/wesib
 */
import { itsFirst } from 'a-iterable';
import { ContextRegistry, ContextValueSpec } from 'context-values';
import { BootstrapContext } from '../../boot';
import { BootstrapValueRegistry } from '../../boot/bootstrap/bootstrap-value-registry.impl';
import { ComponentRegistry } from '../../boot/definition/component-registry.impl';
import { ComponentValueRegistry } from '../../boot/definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../../boot/definition/definition-value-registry.impl';
import { ArraySet, Class } from '../../common';
import { ComponentContext } from '../../component';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { FeatureDef } from '../feature-def';

export interface FeatureRegistryOpts {
  bootstrapContext: BootstrapContext;
  componentRegistry: ComponentRegistry;
  valueRegistry: BootstrapValueRegistry;
  definitionValueRegistry: DefinitionValueRegistry;
  componentValueRegistry: ComponentValueRegistry;
}

class FeatureHandle {

  readonly providers = new Set<Class>();
  private _context?: FeatureContext;

  constructor(readonly feature: Class, private readonly _opts: FeatureRegistryOpts) {
    this.add(feature);
  }

  add(provider: Class) {
    this.providers.add(provider);
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

  provideValues(feature: Class) {

    const def = FeatureDef.of(feature);
    const context = this.context;

    new ArraySet(def.set).forEach(spec => this._opts.valueRegistry.provide(spec));
    new ArraySet(def.perDefinition).forEach(spec => context.perDefinition(spec));
    new ArraySet(def.perComponent).forEach(spec => context.perComponent(spec));
  }

  init(feature: Class) {

    const init = FeatureDef.of(feature).init;

    if (init) {
      init.call(feature, this.context);
    }
  }

  get context(): FeatureContext {
    if (this._context) {
      return this._context;
    }

    const { componentRegistry, definitionValueRegistry, componentValueRegistry } = this._opts;
    const registry = new ContextRegistry<FeatureContext>(this._opts.bootstrapContext);
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

}

/**
 * @internal
 */
export class FeatureRegistry {

  private readonly _handles = new Map<Class, FeatureHandle>();

  static create(opts: FeatureRegistryOpts): FeatureRegistry {
    return new FeatureRegistry(opts);
  }

  private constructor(private readonly _opts: FeatureRegistryOpts) {
  }

  add(feature: Class, provider: Class = feature) {

    const existing = this._handles.get(feature);
    let handle = existing;

    if (!handle) {
      handle = new FeatureHandle(feature, this._opts);
    }
    handle.add(provider);

    const def = FeatureDef.of(feature);

    // Add requirements before the feature itself.
    new ArraySet(def.needs).items.forEach(needed => this.add(needed));

    if (!existing) {
      this._handles.set(feature, handle);
    }

    // Add provided features after the feature itself.
    new ArraySet(def.has).items.forEach(provided => this.add(provided, feature));
  }

  bootstrap() {
    this._provideValues();
    this._initFeatures();
  }

  private _provideValues() {
    this._handles.forEach((handle, feature) => {
      if (feature === handle.provider(this._handles)) {
        handle.provideValues(feature);
      }
    });
  }

  private _initFeatures() {
    this._handles.forEach((handle, feature) => {
      if (feature === handle.provider(this._handles)) {
        handle.init(feature);
      }
    });
  }

}
