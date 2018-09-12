import { ContextValueKey, ContextValues } from '../common';

/**
 * Bootstrap context value provider.
 *
 * It is responsible for constructing the values associated with particular key and available globally. I.e. to
 * other value providers, features, and components.
 *
 * This function is called at most once per bootstrap.
 *
 * @param <S> The type of source value.
 * @param context Target bootstrap context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
export type BootstrapValueProvider<S> = (this: void, context: BootstrapValues) => S | null | undefined;

/**
 * Values available during components bootstrap.
 *
 * These values are provided by `BootstrapValueProvider`s and can be declared by feature definitions using
 * `FeatureDef.bootstraps` properties.
 */
export type BootstrapValues = ContextValues;

/**
 * Bootstrap value definition.
 *
 * When added as `FeatureDef.bootstraps` the value for its `key` is provided by its `provider`.
 */
export interface BootstrapValueDef<V, S = V> {

  /**
   * Bootstrap context value key the `provider` provides value for.
   */
  key: ContextValueKey<V, S>;

  /**
   * Bootstrap context value provider.
   */
  provider: BootstrapValueProvider<S>;

}
