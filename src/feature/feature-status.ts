/**
 * @module @wesib/wesib
 */
import { Class } from '../common';

/**
 * Feature load status.
 *
 * This status is reported by {@link FeatureRef loaded feature reference}.
 *
 * @category Core
 */
export interface FeatureStatus {

  /**
   * Loaded feature class.
   *
   * Note that the class may differ from the one requested to load. E.g. when another feature
   * {@link FeatureDef.Options.has provides} it.
   */
  readonly feature: Class;

  /**
   * Whether the feature is loaded.
   */
  readonly ready: boolean;

}
