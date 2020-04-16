/**
 * @internal
 */
export function isArray<T>(value: T | T[] | null | undefined): value is T[];

/**
 * @internal
 */
export function isArray<T>(value: T | readonly T[] | null | undefined): value is readonly T[];

export function isArray<T>(value: T | readonly T[]): value is T[] {
  return Array.isArray(value);
}
