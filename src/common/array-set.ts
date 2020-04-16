/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { itsEach, itsFirst } from '@proc7ts/a-iterable';
import { isArray } from './types.impl';

/**
 * @category Utility
 */
export class ArraySet<T> implements Iterable<T> {

  readonly items: Set<T>;

  constructor(value?: T | readonly T[]) {
    this.items = value == null ? new Set() : isArray(value) ? new Set(value) : new Set([value]);
  }

  get value(): T | T[] | undefined {
    return this.items.size < 2 ? itsFirst(this.items) : Array.from(this.items);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.items[Symbol.iterator]();
  }

  add(...items: readonly T[]): this {
    return this.addAll(items);
  }

  addAll(items: Iterable<T>): this {
    itsEach(items, item => this.items.add(item));
    return this;
  }

  get size(): number {
    return this.items.size;
  }

  merge(items: readonly T[] | T | undefined): this {
    if (isArray(items)) {
      this.addAll(items);
    } else if (items != null) {
      this.items.add(items);
    }
    return this;
  }

}
