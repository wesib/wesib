/**
 * @internal
 */
export function noop(): void {
}

/**
 * @internal
 */
export type Fn<T, P extends any[], R> = (this: T, ...args: P) => R;

/**
 * @internal
 */
export function mergeFunctions<T, P extends any[], R>(
    first: Fn<T, P, R>,
    second: Fn<T, P, R> | undefined,
    merge: (first: R, second: R) => R): Fn<T, P, R>;

/**
 * @internal
 */
export function mergeFunctions<T, P extends any[], R>(
    first: Fn<T, P, R> | undefined,
    second: Fn<T, P, R>,
    merge?: (first: R, second: R) => R): Fn<T, P, R>;

/**
 * @internal
 */
export function mergeFunctions<T, P extends any[], R>(
    first: Fn<T, P, R> | undefined,
    second: Fn<T, P, R> | undefined,
    merge?: (first: R, second: R) => R): Fn<T, P, R> | undefined;

/**
 * @internal
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
