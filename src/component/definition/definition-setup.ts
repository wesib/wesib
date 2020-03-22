/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextValueSpec } from '@proc7ts/context-values';
import { EventReceiver, EventSupply, OnEvent } from '@proc7ts/fun-events';
import { ComponentContext } from '../component-context';
import { ComponentClass } from './component-class';
import { DefinitionContext } from './definition-context';

/**
 * Component definition setup.
 *
 * It is passed to [[ComponentDef.Options.setup]] method to set up the bootstrap. E.g. by providing definition
 * or component context values.
 *
 * @category Core
 */
export interface DefinitionSetup<T extends object = any> {

  /**
   * Component class constructor.
   */
  readonly componentType: ComponentClass<T>;

  /**
   * Builds an `OnEvent` sender of component definition context upon its readiness.
   *
   * The custom element class is not constructed until component definition is complete.
   * The registered receiver will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the receiver will be notified immediately.
   *
   * @returns `OnEvent` sender of component definition context upon its readiness.
   */
  whenReady(): OnEvent<[DefinitionContext<T>]>;

  /**
   * Registers a receiver of component definition readiness event.
   *
   * The custom element class is not constructed until component definition is complete.
   * The registered receiver will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the receiver will be notified immediately.
   *
   * @param receiver  Target receiver of component definition context upon its readiness.
   *
   * @returns Component definition readiness event supply.
   */
  whenReady(receiver: EventReceiver<[DefinitionContext<T>]>): EventSupply;

  /**
   * Builds an `OnEvent` sender of component context upon its instantiation.
   *
   * If component instantiated after the receiver is registered, that receiver would receive an instantiated component's
   * context immediately.
   *
   * If component already exists when the receiver is registered, that receiver would receive instantiated component's
   * context only when/if component is {@link ComponentContext.whenOn connected}. This is to prevent resource leaking
   * on disconnected components that may be never used again.
   *
   * @returns `OnEvent` sender of instantiated component context.
   */
  whenComponent(): OnEvent<[ComponentContext<T>]>;

  /**
   * Starts sending component instantiation events to the given `receiver`.
   *
   * If component instantiated after the receiver is registered, that receiver would receive an instantiated component's
   * context immediately.
   *
   * If component already exists when the receiver is registered, that receiver would receive instantiated component's
   * context only when/if component is {@link ComponentContext.whenOn connected}. This is to prevent resource leaking
   * on disconnected components that may be never used again.
   *
   * @param receiver  Target receiver of instantiate component contexts.
   *
   * @returns Component instantiation events supply.
   */
  whenComponent(receiver: EventReceiver<[ComponentContext<T>]>): EventSupply;

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

}
