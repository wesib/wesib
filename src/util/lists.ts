/**
 * @internal
 */
export function mergeLists<T>(first: T | T[], second: T | T[] | undefined): T | T[];

/**
 * @internal
 */
export function mergeLists<T>(first: T | T[] | undefined, second: T | T[]): T | T[];

/**
 * @internal
 */
export function mergeLists<T>(first: T | T[] | undefined, second: T | T[] | undefined): T | T[] | undefined;

/**
 * @internal
 */
export function mergeLists<T>(first: T | T[] | undefined, second: T | T[] | undefined): T | T[] | undefined {
  if (first === undefined) {
    return second;
  }
  if (second === undefined) {
    return first;
  }
  if (Array.isArray(first)) {
    if (Array.isArray(second)) {
      return [ ...first, ...second ];
    }
    return [ ...first, second ];
  }
  if (Array.isArray(second)) {
    return [ first, ...second ];
  }
  return [first, second ];
}
