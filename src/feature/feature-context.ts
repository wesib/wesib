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
   * @typeParam TSrc - Source value type.
   * @typeParam TDeps - Dependencies tuple type.
   * @param spec - Context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  abstract provide<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<BootstrapContext, unknown, TSrc, TDeps>,
  ): Supply;

  abstract perDefinition<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<DefinitionContext, unknown, TSrc, TDeps>,
  ): Supply;

  abstract perComponent<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<ComponentContext, unknown, TSrc, TDeps>,
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
