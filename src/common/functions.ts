/**
 * A no-op function that does nothing.
 */
export function noop(): void {
}

export function mergeFunctions<P extends any[], R, T>(
    first: (this: T, ...args: P) => R,
    second: ((this: T, ...args: P) => R) | undefined,
    merge: (first: R, second: R) => R): (this: T, ...args: P) => R;

export function mergeFunctions<P extends any[], R, T>(
    first: ((this: T, ...args: P) => R) | undefined,
    second: (this: T, ...args: P) => R,
    merge?: (first: R, second: R) => R): (this: T, ...args: P) => R;

export function mergeFunctions<P extends any[], R, T>(
    first: ((this: T, ...args: P) => R) | undefined,
    second: ((this: T, ...args: P) => R) | undefined,
    merge?: (first: R, second: R) => R): ((this: T, ...args: P) => R) | undefined;

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
    first: ((this: T, ...args: P) => R) | undefined,
    second: ((this: T, ...args: P) => R) | undefined,
    merge: (first: R, second: R) => R = (f, s) => s): ((this: T, ...args: P) => R) | undefined {
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
