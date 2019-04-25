/**
 * @internal
 */
export function isArray<T>(value: T | T[]): value is T[];

/**
 * @internal
 */
export function isArray<T>(value: T | readonly T[]): value is readonly T[];

export function isArray<T>(value: T | readonly T[]): value is T[] {
  return Array.isArray(value);
}
