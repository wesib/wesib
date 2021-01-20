/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class } from '@proc7ts/primitives';
import { TypedClassDecorator } from '../common';
import { FeatureDef } from './feature-def';

/**
 * Feature class decorator.
 *
 * Decorate a class with this decorator to define it as a feature like this:
 * ```TypeScript
 * @Feature({ needs: [OtherFeature, MyComponent] })
 * class MyFeature {
 *   // ...
 * }
 * ```
 *
 * Such feature can be passed to {@link bootstrapComponents} function or referenced by other features.
 *
 * This is an alternative to direct call to {@link FeatureDef.define} method.
 *
 * @category Core
 * @typeParam TClass - A type of decorated feature class.
 * @param defs - Feature definitions.
 *
 * @returns A feature class decorator.
 */
export function Feature<TClass extends Class = any>(...defs: FeatureDef[]): TypedClassDecorator<TClass> {
  return (type: TClass) => FeatureDef.define(type, ...defs);
}
