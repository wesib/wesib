/**
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValueSpec, SingleContextKey } from 'context-values';
import { AfterEvent, OnEvent } from 'fun-events';
import { BootstrapContext, BootstrapSetup } from '../boot';
import { Class } from '../common';
import { ComponentContext } from '../component';
import { ComponentClass, ComponentFactory, DefinitionContext } from '../component/definition';
import { LoadedFeature } from './loaded-feature';

const FeatureContext_key = new SingleContextKey<FeatureContext>('feature-context');

/**
 * Feature initialization context.
 */
export abstract class FeatureContext extends BootstrapContext implements BootstrapSetup {

  /**
   * A key of feature context value containing the feature context itself.
   */
  static get [ContextKey__symbol](): ContextKey<FeatureContext> {
    return FeatureContext_key;
  }

  get onDefinition(): OnEvent<[DefinitionContext]> {
    return this.get(BootstrapContext).onDefinition;
  }

  get onComponent(): OnEvent<[ComponentContext]> {
    return this.get(BootstrapContext).onComponent;
  }

  /**
   * Provides bootstrap context value.
   *
   * Note that this happens when bootstrap context already exists. To provide a value before bootstrap context created
   * a [[BootstrapSetup.provide]] method can be used.
   *
   * @typeparam Deps  Dependencies tuple type.
   * @typeparam Src  Source value type.
   * @typeparam Seed  Value seed type.
   * @param spec  Context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  abstract provide<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<BootstrapContext, any, Deps, Src, Seed>,
  ): () => void;

  /**
   * Provides a value available in each component definition context.
   *
   * @typeparam D  A type of dependencies.
   * @typeparam S  The type of context value sources.
   * @param spec  Component definition context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  abstract perDefinition<D extends any[], S>(spec: ContextValueSpec<DefinitionContext, any, D, S>): () => void;

  /**
   * Provides a value available in each component context.
   *
   * @typeparam D  A type of dependencies.
   * @typeparam S  The type of context value sources.
   * @param spec  Component context value specifier.
   *
   * A function that removes the given context value specifier when called.
   */
  abstract perComponent<D extends any[], S>(spec: ContextValueSpec<ComponentContext, any, D, S>): () => void;

  /**
   * Defines a component.
   *
   * Creates a custom element according to component definition, and registers it with custom elements registry.
   *
   * Note that custom element definition will happen only when all features configuration complete.
   *
   * @typeparam T  A type of component.
   * @param componentType  Component class constructor.
   *
   * @return Custom element class constructor registered as custom element.
   *
   * @throws TypeError  If `componentType` does not contain a component definition.
   */
  abstract define<T extends object>(componentType: ComponentClass<T>): void;

  whenDefined<C extends object>(componentType: ComponentClass<C>): Promise<ComponentFactory<C>> {
    return this.get(BootstrapContext).whenDefined(componentType);
  }

  /**
   * Registers feature readiness callback.
   *
   * The registered callback function will be called once bootstrap is complete and the feature is loaded.
   *
   * If the above condition satisfied, the callback will be notified immediately.
   *
   * @param callback  A callback to notify on feature load.
   */
  abstract whenReady(callback: (this: void) => void): void;

  load(feature: Class): AfterEvent<[LoadedFeature]> {
    return this.get(BootstrapContext).load(feature);
  }

}
