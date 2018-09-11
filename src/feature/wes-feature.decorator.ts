import { TypedClassDecorator } from '../common';
import { FeatureDef, FeatureType } from './feature';

/**
 * Feature class decorator.
 *
 * Decorate a class with this decorator to define it as a feature like this:
 * ```TypeScript
 * @WesFeature({ requires: [OtherFeature, MyComponent] })
 * class MyFeature {
 *   // ...
 * }
 * ```
 *
 * Such feature can be passed to `bootstrapComponents()` function or referenced by other features.
 *
 * This is an alternative to direct call to `FeatureDef.define()` method.
 *
 * @param <T> A type of feature.
 * @param def Feature definition.
 *
 * @returns A feature class decorator.
 */
export function WesFeature<T extends FeatureType = any>(def: FeatureDef): TypedClassDecorator<T> {
  return (type: T) => FeatureDef.define(type, def);
}
