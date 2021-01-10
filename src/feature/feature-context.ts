/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValueSpec, SingleContextKey } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class, Supply, SupplyPeer } from '@proc7ts/primitives';
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
export abstract class FeatureContext
    extends BootstrapContext
    implements BootstrapSetup, SupplyPeer {

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
   * An `OnEvent` sender of feature readiness event.
   *
   * The registered receiver will be notified once bootstrap is complete and the feature is loaded.
   *
   * If the above conditions satisfied already, the receiver will be notified immediately.
   */
  abstract readonly whenReady: OnEvent<[FeatureContext]>;

  /**
   * An `OnEvent` sender of component definition events.
   *
   * The registered receiver will be notified when new component class is defined, but before its custom element class
   * constructed.
   */
  abstract readonly onDefinition: OnEvent<[DefinitionContext]>;

  /**
   * An `OnEvent` sender of component construction events.
   *
   * The registered receiver will be notified right before component is constructed.
   */
  abstract readonly onComponent: OnEvent<[ComponentContext]>;

  /**
   * Feature supply.
   *
   * Cut off once feature unloaded.
   */
  abstract readonly supply: Supply;

  /**
   * Provides bootstrap context value.
   *
   * Note that this happens when bootstrap context already exists. To provide a value before bootstrap context created
   * a {@link BootstrapSetup.provide} method can be used.
   *
   * @typeParam TDeps - Dependencies tuple type.
   * @typeParam TSrc - Source value type.
   * @typeParam TSeed - Value seed type.
   * @param spec - Context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  abstract provide<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<BootstrapContext, any, TDeps, TSrc, TSeed>,
  ): Supply;

  abstract perDefinition<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<DefinitionContext, any, TDeps, TSrc, TSeed>,
  ): Supply;

  abstract perComponent<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<ComponentContext, any, TDeps, TSrc, TSeed>,
  ): Supply;

  abstract setupDefinition<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionSetup]>;

  /**
   * Defines a component.
   *
   * Creates a custom element according to component definition, and registers it with custom elements registry.
   *
   * Note that custom element definition will happen only when all features configuration complete.
   *
   * @typeParam T - A type of component.
   * @param componentType - Component class constructor.
   *
   * @return Custom element class constructor registered as custom element.
   *
   * @throws TypeError  If `componentType` does not contain a component definition.
   */
  abstract define<T extends object>(componentType: ComponentClass<T>): void;

  whenDefined<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionContext<T>]> {
    return this.get(BootstrapContext).whenDefined(componentType);
  }

  load(feature: Class, user?: SupplyPeer): FeatureRef {
    return this.get(BootstrapContext).load(
        feature,
        user ? new Supply().needs(this).needs(user) : this,
    );
  }

}
