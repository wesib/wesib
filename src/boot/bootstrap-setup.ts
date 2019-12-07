/**
 * @module @wesib/wesib
 */
import { ContextValueSpec } from 'context-values';
import { OnEvent } from 'fun-events';
import { BootstrapContext } from './index';
import { ComponentContext } from '../component';
import { DefinitionContext } from '../component/definition';

/**
 * Bootstrap context setup.
 *
 * It is passed to [[FeatureDef.setup]] method to set up the bootstrap. E.g. by providing bootstrap context values.
 */
export interface BootstrapSetup {

  /**
   * Registers component definition listener.
   *
   * This listener will be called when new component class is defined, but before its custom element class constructed.
   *
   * @param listener  A listener to notify on each component definition.
   *
   * @return An event supply.
   */
  readonly onDefinition: OnEvent<[DefinitionContext]>;

  /**
   * Registers component construction listener.
   *
   * This listener will be called right before component is constructed.
   *
   * @param listener  A listener to notify on each component construction.
   *
   * @return An event supply.
   */
  readonly onComponent: OnEvent<[ComponentContext]>;

  /**
   * Provides bootstrap context value before context creation.
   *
   * @typeparam Deps  Dependencies tuple type.
   * @typeparam Src  Source value type.
   * @typeparam Seed  Value seed type.
   * @param spec  Context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  provide<Deps extends any[], Src, Seed>(
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
  perDefinition<D extends any[], S>(spec: ContextValueSpec<DefinitionContext, any, D, S>): () => void;

  /**
   * Provides a value available in each component context.
   *
   * @typeparam D  A type of dependencies.
   * @typeparam S  The type of context value sources.
   * @param spec  Component context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  perComponent<D extends any[], S>(spec: ContextValueSpec<ComponentContext, any, D, S>): () => void;

  /**
   * Registers feature readiness callback.
   *
   * The registered callback function will be called once bootstrap is complete and the feature is loaded.
   *
   * If the above condition satisfied, the callback will be notified immediately.
   *
   * @param callback  A callback to notify on feature load.
   */
  whenReady(callback: (this: void) => void): void;

}
