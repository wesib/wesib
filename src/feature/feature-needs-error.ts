/**
 * @module @wesib/wesib
 */
import { Class } from '../common';

/**
 * Feature need.
 *
 * Indicates why one feature needs another one. The reason can be one of:
 *
 * - `needs` when feature {@link FeatureDef.needs depends} on another one, or
 * - `has` when feature {@link FeatureDef.has provides} another one.
 */
export type FeatureNeed = [Class, 'needs' | 'has', Class];

/**
 * An error in feature needs. I.e. circular dependency.
 */
export class FeatureNeedsError extends Error {

  /**
   * Feature needs causing this error.
   */
  readonly needs: readonly FeatureNeed[];

  /**
   * Constructs feature needs error.
   *
   * @param needs  Feature needs causing the error.
   */
  constructor(needs: readonly FeatureNeed[]) {
    super(
        'Circular feature needs: '
        + needs.reduce(
        (prev, [feature, reason, need]) =>
            (prev ? prev : feature.name) + ` ${reason} ${need.name}`, ''));
    this.needs = needs;
  }

}
