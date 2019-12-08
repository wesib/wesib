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
   * Releases feature reference.
   *
   * If there is no more unreleased feature references, then unloads the feature. This removes everything set up by the
   * feature via [[BootstrapSetup]] and [[DefinitionSetup]].
   *
   * @param reason  Arbitrary reason of feature reference release. This will be reported by load status supplies
   * as their cut off reason.
   */
  abstract off(reason?: any): void;

}
