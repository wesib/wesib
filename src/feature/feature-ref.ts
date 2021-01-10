/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { AfterEvent, EventKeeper, OnEvent } from '@proc7ts/fun-events';
import { Supply, SupplyPeer } from '@proc7ts/primitives';
import { FeatureStatus } from './feature-status';

/**
 * Dynamically loaded feature reference.
 *
 * It is returned from {@link BootstrapContext.load} and can be used to read feature load status and unload it.
 *
 * Implements an `EventKeeper` interface by sending a feature load status updates.
 *
 * @category Core
 */
export interface FeatureRef extends EventKeeper<[FeatureStatus]>, SupplyPeer {

  /**
   * An `AfterEvent` keeper of feature load status.
   *
   * The `[AfterEvent__symbol]` property is an alias of this one.
   */
  readonly read: AfterEvent<[FeatureStatus]>;

  /**
   * An `OnEvent` sender of feature readiness event.
   */
  readonly whenReady: OnEvent<[FeatureStatus]>;

  /**
   * Feature supply.
   *
   * Dismisses this feature reference when cut off.
   *
   * When all feature references dismissed, then unloads the feature. This removes everything set up by the
   * feature via {@link BootstrapSetup} and {@link DefinitionSetup}.
   */
  readonly supply: Supply;

}
