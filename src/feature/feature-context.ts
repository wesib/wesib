import { CxAsset, CxEntry, cxSingle } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { BootstrapContext, BootstrapSetup } from '../boot';
import { ComponentClass } from '../component/definition';

/**
 * Feature initialization context.
 *
 * @category Core
 */
export interface FeatureContext extends BootstrapContext, BootstrapSetup, SupplyPeer {
  /**
   * Feature class this context is created for.
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
   * Feature supply.
   *
   * Cut off once feature unloaded.
   */
  readonly supply: Supply;

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
  provide<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, BootstrapContext>): Supply;

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
  define<T extends object>(componentType: ComponentClass<T>): void;
}

/**
 * Feature context entry containing the feature context itself.
 *
 * @category Core
 */
export const FeatureContext: CxEntry<FeatureContext> = {
  perContext: /*#__PURE__*/ cxSingle(),
  toString: () => '[FeatureContext]',
};
