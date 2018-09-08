import { ContextValueKey } from './context-value-key';

/**
 * The values available from context.
 *
 * The values are available by their keys.
 */
export interface ContextValues {

  get<V, S>(key: ContextValueKey<V, S>, defaultValue?: V): V;

  get<V, S>(key: ContextValueKey<V, S>, defaultValue: V | null): V | null;

  get<V, S>(key: ContextValueKey<V, S>, defaultValue: V | undefined): V | undefined;

  /**
   * Returns a value associated with the given key.
   *
   * @param <V> A type of associated value.
   * @param <S> A type of source values.
   * @param key Target key.
   * @param defaultValue Default value to return if there is no value associated with the given key. Can be `null`
   * or `undefined` too.
   *
   * @returns Associated value.
   *
   * @throws Error If there is no value associated with the given key and the default key is not provided neither
   * as function argument, nor as `ContextValueKey.defaultValue` property.
   */
  get<V, S>(key: ContextValueKey<V, S>, defaultValue: V | null | undefined): V | null | undefined;

}
