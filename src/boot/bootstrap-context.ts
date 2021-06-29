import { CxEntry, cxSingle, CxValues } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { SupplyPeer } from '@proc7ts/supply';
import { ComponentClass, DefinitionContext } from '../component/definition';
import { FeatureRef } from '../feature';

/**
 * Components bootstrap context.
 *
 * An instance of this class is passed to {@link FeatureDef.init} method so that the feature can configure
 * itself.
 *
 * Extends `BootstrapValues` interface. The values could be {@link BootstrapSetup.provide pre-configured} in feature
 * definitions.
 *
 * @category Core
 */
export interface BootstrapContext extends CxValues {

  /**
   * An `OnEvent` sender of bootstrap readiness event.
   *
   * The registered receiver will be notified once bootstrap is complete.
   *
   * If bootstrap is complete already, the receiver will be notified immediately.
   */
  readonly whenReady: OnEvent<[BootstrapContext]>;

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @typeParam T - A type of component.
   * @param componentType - Component class constructor.
   *
   * @return An `OnEvent` sender of definition context sent when the given `componentType` is registered.
   */
  whenDefined<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionContext<T>]>;

  /**
   * Allows to loads the given `feature`.
   *
   * @param feature - The feature to load.
   * @param user - The user of the feature. The feature reference will be dismissed once the user's supply is cut off.
   *
   * @returns  Loaded feature reference.
   */
  load(feature: Class, user?: SupplyPeer): FeatureRef;

}

/**
 * Context entry containing bootstrap context as its value.
 *
 * @category Core
 */
export const BootstrapContext: CxEntry<BootstrapContext> = {
  perContext: (/*#__PURE__*/ cxSingle()),
};
