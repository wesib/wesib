import { ContextValueKey, ContextValues } from '../common/context';

/**
 * Bootstrap context value provider.
 *
 * It is responsible for constructing the values associated with particular key and available globally. I.e. to
 * other value providers, component features, and web components.
 *
 * This function is called at most once per component, unless it returns `null`/`undefined`. In the latter case
 * it may be called again later.
 *
 * @param <S> The type of source value.
 * @param context Target component context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
export type BootstrapValueProvider<S> = (this: void, context: BootstrapValues) => S | null | undefined;

/**
 * Values available during components bootstrap.
 *
 * These values are provided by `BootstrapValueProvider`s and can be declared by feature definitions using
 * `FeatureDef.provided` properties.
 */
export type BootstrapValues = ContextValues;

/**
 * Bootstrap value provider info.
 *
 * When added as `FeatureDef.provides` the value for its `key` is provided by its `provider`.
 */
export interface BootstrapValue<V, S> {

  /**
   * Bootstrap context value key the `provider` provides value for.
   */
  key: ContextValueKey<V, S>;

  /**
   * Bootstrap context value provider.
   */
  provider: BootstrapValueProvider<S>;

}
