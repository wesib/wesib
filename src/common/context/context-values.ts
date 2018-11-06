import { ContextRequest } from './context-value';

/**
 * The values available from context.
 *
 * The values are available by their keys.
 */
export interface ContextValues {

  /**
   * Returns a value associated with the given key.
   *
   * @param <V> A type of associated value.
   * @param request Context value request with target key.
   * @param opts Context value request options.
   *
   * @returns Associated value or `null` if there is no associated value.
   */
  get<V>(request: ContextRequest<V>, opts: { or: null }): V | null;

  /**
   * Returns a value associated with the given key.
   *
   * @param <V> A type of associated value.
   * @param request Context value request with target key.
   * @param opts Context value request options.
   *
   * @returns Associated value or `null` if there is no associated value.
   */
  get<V>(request: ContextRequest<V>, opts: { or: undefined }): V | undefined;

  /**
   * Returns a value associated with the given key.
   *
   * @param <V> A type of associated value.
   * @param request Context value request with target key.
   * @param opts Context value request options.
   *
   * @returns Associated value.
   *
   * @throws Error If there is no value associated with the given key and the default key is not provided neither
   * as function argument, nor as key default.
   */
  get<V>(request: ContextRequest<V>, opts?: { or: V }): V;

}
