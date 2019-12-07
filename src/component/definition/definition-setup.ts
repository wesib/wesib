/**
 * @module @wesib/wesib
 */
import { ContextValueSpec } from 'context-values';
import { ComponentContext } from '../component-context';
import { ComponentClass } from './component-class';
import { DefinitionContext } from './definition-context';

/**
 * Component definition setup.
 *
 * It is passed to [[ComponentDef.setup]] method to set up the bootstrap. E.g. by providing definition or component
 * context values.
 */
export interface DefinitionSetup<T extends object = any> {

  /**
   * Component class constructor.
   */
  readonly componentType: ComponentClass<T>;

  /**
   * Provides a value available in component definition context.
   *
   * @typeparam Deps  A type of dependencies.
   * @typeparam Src  The type of context value sources.
   * @typeparam Seed  Value seed type.
   * @param spec  Component context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  perDefinition<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<DefinitionContext, any, Deps, Src, Seed>,
  ): () => void;

  /**
   * Provides a value available in the context of each component of the defined component type.
   *
   * @typeparam Deps  A type of dependencies.
   * @typeparam Src  The type of context value sources.
   * @typeparam Seed  Value seed type.
   * @param spec  Component context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  perComponent<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<ComponentContext<T>, any, Deps, Src, Seed>,
  ): () => void;

  /**
   * Registers component definition readiness callback.
   *
   * The custom element class is not constructed until component definition is complete.
   * The registered callback will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the callback will be notified immediately.
   *
   * @param callback  A callback to notify on custom element class construction.
   */
  whenReady(callback: (this: void, context: DefinitionContext<T>) => void): void;

}
