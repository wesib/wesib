import { ContextValueSpec } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class, Supply } from '@proc7ts/primitives';
import { ComponentContext } from '../component';
import { ComponentClass, DefinitionContext, DefinitionSetup } from '../component/definition';
import { FeatureContext } from '../feature';
import { BootstrapContext } from './index';

/**
 * Bootstrap context setup.
 *
 * It is passed to {@link FeatureDef.Options.setup} method to set up the bootstrap. E.g. by providing bootstrap context
 * values.
 *
 * @category Core
 */
export interface BootstrapSetup {

  /**
   * Feature class performing bootstrap setup.
   */
  readonly feature: Class;

  /**
   * An `OnEvent` sender of feature readiness event.
   *
   * The registered receiver will be notified once bootstrap is complete and the feature is loaded.
   *
   * If the above conditions satisfied already, the receiver will be notified immediately.
   */
  readonly whenReady: OnEvent<[FeatureContext]>;

  /**
   * An `OnEvent` sender of component definition events.
   *
   * The registered receiver will be notified when new component class is defined, but before its custom element class
   * constructed.
   */
  readonly onDefinition: OnEvent<[DefinitionContext]>;

  /**
   * An `OnEvent` sender of component construction events.
   *
   * The registered receiver will be notified right before component is constructed.
   */
  readonly onComponent: OnEvent<[ComponentContext]>;

  /**
   * Provides bootstrap context value before context creation.
   *
   * @typeParam TDeps - Dependencies tuple type.
   * @typeParam TSrc - Source value type.
   * @typeParam TSeed - Value seed type.
   * @param spec - Context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  provide<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<BootstrapContext, any, TDeps, TSrc, TSeed>,
  ): Supply;

  /**
   * Provides a value available in each component definition context.
   *
   * @typeParam TDeps - A type of dependencies.
   * @typeParam TSrc - The type of context value sources.
   * @typeParam TSeed - Value seed type.
   * @param spec - Component definition context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  perDefinition<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<DefinitionContext, any, TDeps, TSrc, TSeed>,
  ): Supply;

  /**
   * Provides a value available in each component context.
   *
   * @typeParam TDeps - A type of dependencies.
   * @typeParam TSrc - The type of context value sources.
   * @typeParam TSeed - Value seed type.
   * @param spec - Component context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  perComponent<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<ComponentContext, any, TDeps, TSrc, TSeed>,
  ): Supply;

  /**
   * Sets up the definition of component of the given type..
   *
   * Whenever the definition of component of the given type or any of its subtype starts, the returned `OnEvent` sender
   * sends a {@link DefinitionSetup} instance, that can be used to set up the definition.
   *
   * @param componentType - Target component type.
   *
   * @returns An `OnEvent` sender of component definition setup instances.
   */
  setupDefinition<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionSetup]>;

}
