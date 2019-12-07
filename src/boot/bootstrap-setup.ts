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
