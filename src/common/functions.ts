/**
 * @module @wesib/wesib
 */
/**
 * Merges two functions by calling one after another.
 *
 * Optionally merges function call results.
 *
 * @typeparam P  Function parameter types as tuple.
 * @typeparam R  A type of function result.
 * @typeparam T  A type if `this` object expected by function.
 * @param first  The first function to call.
 * @param second  The second function to call.
 * @param merge  Optional function call results merger. Accepts two function results as arguments and returns the final
 * result. When omitted the first function call result is ignored and the second function's call result is returned.
 *
 * @return A function that calls both of the given ones and merges their results. If one of the functions is absent,
 * then just returns another one. If both are absent, then returns `undefined`.
 */
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

export function mergeFunctions<P extends any[], R, T>(
    first: ((this: T, ...args: P) => R) | undefined,
    second: ((this: T, ...args: P) => R) | undefined,
    merge: (first: R, second: R) => R = (_f, s) => s): ((this: T, ...args: P) => R) | undefined {
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
