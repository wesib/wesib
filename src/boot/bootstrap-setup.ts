import { ContextValueSpec } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
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
   * @typeParam TSrc - Source value type.
   * @typeParam TDeps - Dependencies tuple type.
   * @param spec - Context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  provide<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<BootstrapContext, unknown, TSrc, TDeps>,
  ): Supply;

  /**
   * Provides a value available in each component definition context.
   *
   * @typeParam TSrc - The type of context value sources.
   * @typeParam TDeps - A type of dependencies.
   * @param spec - Component definition context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  perDefinition<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<DefinitionContext, unknown, TSrc, TDeps>,
  ): Supply;

  /**
   * Provides a value available in each component context.
   *
   * @typeParam TSrc - The type of context value sources.
   * @typeParam TDeps - A type of dependencies.
   * @param spec - Component context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  perComponent<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<ComponentContext, unknown, TSrc, TDeps>,
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
