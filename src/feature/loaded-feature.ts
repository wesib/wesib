/**
 * @module @wesib/wesib
 */
import { Class } from '../common';

/**
 * Loaded feature info.
 *
 * This object is reported by event keeper returned from [BootstrapContext.load] method.
 */
export interface LoadedFeature {

  /**
   * Loaded feature class.
   *
   * Note that the class may differ from the one requested to load. E.g. when another feature
   * {@link FeatureDef.has provides} it.
   */
  readonly feature: Class;

  /**
   * Whether the feature is loaded.
   */
  readonly ready: boolean;

}
