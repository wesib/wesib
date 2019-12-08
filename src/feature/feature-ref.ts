/**
 * @module wesib/wesib
 */
import { AfterEvent, AfterEvent__symbol, EventKeeper } from 'fun-events';
import { FeatureStatus } from './feature-status';

/**
 * Dynamically loaded feature reference.
 *
 * It is returned from [[BootstrapContext.load]] and can be used to read feature load status and unload it.
 *
 * Implements an `EventKeeper` interface by sending a feature load status updates.
 */
export abstract class FeatureRef implements EventKeeper<[FeatureStatus]> {

  /**
   * An `AfterEvent` sender of feature load status updates.
   *
   * The `[AfterEvent__symbol]` property is an alias of this one.
   */
  abstract readonly read: AfterEvent<[FeatureStatus]>;

  get [AfterEvent__symbol](): AfterEvent<[FeatureStatus]> {
    return this.read;
  }

  /**
   * A promise resolved when feature is unloaded.
   *
   * This happens after all feature references dismissed.
   */
  abstract readonly down: Promise<void>;

  /**
   * Dismisses feature reference.
   *
   * When all feature references dismissed, then unloads the feature. This removes everything set up by the
   * feature via [[BootstrapSetup]] and [[DefinitionSetup]].
   *
   * @param reason  Arbitrary reason of feature reference dismiss. This will be reported by load status supplies
   * as their cut off reason.
   *
   * @returns A promise resolved when feature is unloaded. This happens only after all feature references dismissed.
   */
  abstract dismiss(reason?: any): Promise<void>;

}
