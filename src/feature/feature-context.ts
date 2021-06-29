import { CxAsset, CxEntry, CxRequest, cxSingle } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { BootstrapContext, BootstrapSetup } from '../boot';
import { ComponentContext } from '../component';
import { ComponentClass, DefinitionContext, DefinitionSetup } from '../component/definition';
import { FeatureRef } from './feature-ref';

const FeatureContext$perContext: CxEntry.Definer<FeatureContext> = (/*#__PURE__*/ cxSingle());

/**
 * Feature initialization context.
 *
 * @category Core
 */
export abstract class FeatureContext implements BootstrapContext, BootstrapSetup, SupplyPeer {

  /**
   * Feature context entry containing the feature context itself.
   */
  static perContext(target: CxEntry.Target<FeatureContext>): CxEntry.Definition<FeatureContext> {
    return FeatureContext$perContext(target);
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

  abstract get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest.WithoutFallback<TValue>): TValue;
  abstract get<TValue>(entry: CxEntry<TValue, unknown>, request: CxRequest.WithFallback<TValue>): TValue;
  abstract get<TValue>(entry: CxEntry<TValue, unknown>, request?: CxRequest<TValue>): TValue | null;

  /**
   * Provides asset for bootstrap context entry
   *
   * Note that this happens when bootstrap context already exists. To provide a value before bootstrap context created
   * a {@link BootstrapSetup.provide} method can be used.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  abstract provide<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, BootstrapContext>): Supply;

  abstract perDefinition<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, DefinitionContext>): Supply;

  abstract perComponent<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, ComponentContext>): Supply;

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
