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
   * @typeparam D  A type of dependencies.
   * @typeparam S  The type of context value sources.
   * @param spec  Component definition context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  perDefinition<D extends any[], S>(spec: ContextValueSpec<DefinitionContext, any, D, S>): () => void;

  /**
   * Provides a value available in the context of each component of the defined component type.
   *
   * @typeparam D  A type of dependencies.
   * @typeparam S  The type of context value sources.
   * @param spec  Component context value specifier.
   *
   * A function that removes the given context value specifier when called.
   */
  perComponent<D extends any[], S>(spec: ContextValueSpec<ComponentContext, any, D, S>): () => void;

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
