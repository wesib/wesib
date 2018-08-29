/**
 * A no-op function that does nothing.
 */
export function noop(): void {
}

/**
 * A function type.
 *
 * @param <P> Function parameter types as tuple.
 * @param <R> A type of function result.
 * @param <T> A type if `this` object expected by function.
 */
export type Fn<P extends any[], R, T = any> = (this: T, ...args: P) => R;

/**
 * Function argument types.
 *
 * @param <F> Function type.
 */
export type ArgumentTypes<F extends (...args: any[]) => any> = F extends (...args: infer A) => any ? A : never;

export function mergeFunctions<P extends any[], R, T>(
    first: Fn<P, R, T>,
    second: Fn<P, R, T> | undefined,
    merge: (first: R, second: R) => R): Fn<P, R, T>;

export function mergeFunctions<P extends any[], R, T>(
    first: Fn<P, R, T> | undefined,
    second: Fn<P, R, T>,
    merge?: (first: R, second: R) => R): Fn<P, R, T>;

export function mergeFunctions<P extends any[], R, T>(
    first: Fn<P, R, T> | undefined,
    second: Fn<P, R, T> | undefined,
    merge?: (first: R, second: R) => R): Fn<P, R, T> | undefined;

/**
 * Merges two functions by calling one after another.
 *
 * Optionally merges function call results.
 *
 * @param <P> Function parameter types as tuple.
 * @param <R> A type of function result.
 * @param <T> A type if `this` object expected by function.
 * @param first The first function to call.
 * @param second The second function to call.
 * @param merge Optional function call results merger. Accepts two function results as arguments and returns the final
 * result. When omitted the first function call result is ignored and the second function's call result is returned.
 *
 * @return A function that calls both of the given ones and merges their results. If one of the functions is absent,
 * then just returns another one. If both are absent, then returns `undefined`.
 */
export function mergeFunctions<P extends any[], R, T>(
    first: Fn<P, R, T> | undefined,
    second: Fn<P, R, T> | undefined,
    merge: (first: R, second: R) => R = (f, s) => s): Fn<P, R, T> | undefined {
  if (!first) {
    return second;
  }
  if (!second) {
    return first;
  }
  return function(this: T, ...args: P) {
    return merge(
      first.apply(this, args),
      second.apply(this, args));
  };
}
