/**
 * A no-op function that does nothing.
 */
export function noop(): void {
}

/**
 * A function type.
 *
 * @param <T> A type if `this` object expected by function.
 * @param <P> Function parameter types as tuple.
 * @param <R> A type of function result.
 */
export type Fn<T, P extends any[], R> = (this: T, ...args: P) => R;

export function mergeFunctions<T, P extends any[], R>(
    first: Fn<T, P, R>,
    second: Fn<T, P, R> | undefined,
    merge: (first: R, second: R) => R): Fn<T, P, R>;

export function mergeFunctions<T, P extends any[], R>(
    first: Fn<T, P, R> | undefined,
    second: Fn<T, P, R>,
    merge?: (first: R, second: R) => R): Fn<T, P, R>;

export function mergeFunctions<T, P extends any[], R>(
    first: Fn<T, P, R> | undefined,
    second: Fn<T, P, R> | undefined,
    merge?: (first: R, second: R) => R): Fn<T, P, R> | undefined;

/**
 * Merges two functions by calling one after another.
 *
 * Optionally merges function call results.
 *
 * @param first The first function to call.
 * @param second The second function to call.
 * @param merge Optional function call results merger. Accepts two function results as arguments and returns the final
 * result. When omitted the first function call result is ignored and the second function's call result is returned.
 *
 * @return A function that calls both of the given ones and merges their results. If one of the functions is absent,
 * then just returns another one. If both are absent, then returns `undefined`.
 */
export function mergeFunctions<T, P extends any[], R>(
    first: Fn<T, P, R> | undefined,
    second: Fn<T, P, R> | undefined,
    merge: (first: R, second: R) => R = (f, s) => s): Fn<T, P, R> | undefined {
  if (!first) {
    return second;
  }
  if (!second) {
    return first;
  }
  return function(this: T, ...args: P) {
    return merge(
      first.call(this, ...args),
      second.call(this, ...args));
  };
}
