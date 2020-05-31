/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValueSpec, SingleContextKey } from '@proc7ts/context-values';
import { EventReceiver, EventSupply, OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { BootstrapContext, BootstrapSetup } from '../boot';
import { ComponentContext } from '../component';
import { ComponentClass, DefinitionContext, DefinitionSetup } from '../component/definition';
import { FeatureRef } from './feature-ref';

/**
 * @internal
 */
const FeatureContext__key = (/*#__PURE__*/ new SingleContextKey<FeatureContext>('feature-context'));

/**
 * Feature initialization context.
 *
 * @category Core
 */
export abstract class FeatureContext extends BootstrapContext implements BootstrapSetup {

  /**
   * A key of feature context value containing the feature context itself.
   */
  static get [ContextKey__symbol](): ContextKey<FeatureContext> {
    return FeatureContext__key;
  }

  /**
   * Feature class this context is created for.
   */
  abstract readonly feature: Class;

  /**
   * Builds an `OnEvent` sender of feature readiness event.
   *
   * The registered receiver will be notified once bootstrap is complete and the feature is loaded.
   *
   * If the above conditions satisfied already, the receiver will be notified immediately.
   *
   * @returns `OnEvent` sender of ready feature context.
   */
  abstract whenReady(): OnEvent<[FeatureContext]>;

  /**
   * Registers a receiver of feature readiness event.
   *
   * The registered receiver will be notified once bootstrap is complete and the feature is loaded.
   *
   * If the above conditions satisfied already, the receiver will be notified immediately.
   *
   * @param receiver  Target receiver of ready feature context.
   *
   * @returns Feature readiness event supply.
   */
  abstract whenReady(receiver: EventReceiver<[FeatureContext]>): EventSupply;

  /**
   * Builds an `OnEvent` sender of component definition events.
   *
   * The registered receiver will be notified when new component class is defined, but before its custom element class
   * constructed.
   *
   * @returns `OnEvent` sender of component definition contexts.
   */
  abstract onDefinition(): OnEvent<[DefinitionContext]>;

  /**
   * Starts sending component definition events to the given `receiver`.
   *
   * The receiver will be notified when new component class is defined, but before its custom element class
   * constructed.
   *
   * @param receiver  Target receiver of component definition contexts.
   *
   * @returns Component definition events supply.
   */
  abstract onDefinition(receiver: EventReceiver<[DefinitionContext]>): EventSupply;

  /**
   * Builds an `OnEvent` sender of component construction events.
   *
   * The registered receiver will be notified right before component is constructed.
   *
   * @returns `OnEvent` sender of constructed component contexts.
   */
  abstract onComponent(): OnEvent<[ComponentContext]>;

  /**
   * Starts sending component construction events to the given `receiver`.
   *
   * @param receiver  Target receiver of constructed component contexts.
   *
   * @returns Component construction events supply.
   */
  abstract onComponent(receiver: EventReceiver<[ComponentContext]>): EventSupply;

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

  abstract perDefinition<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<DefinitionContext, any, Deps, Src, Seed>,
  ): () => void;

  abstract perComponent<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<ComponentContext, any, Deps, Src, Seed>,
  ): () => void;

  abstract setupDefinition<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionSetup]>;

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

  whenDefined<C extends object>(componentType: ComponentClass<C>): OnEvent<[DefinitionContext<C>]> {
    return this.get(BootstrapContext).whenDefined(componentType);
  }

  load(feature: Class): FeatureRef {
    return this.get(BootstrapContext).load(feature);
  }

}
