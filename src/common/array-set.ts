import { AIterable } from 'a-iterable';

export class ArraySet<T> extends AIterable<T> {

  readonly items: Set<T>;

  constructor(value?: T | T[]) {
    super();
    this.items = value == null ? new Set() : Array.isArray(value) ? new Set(value) : new Set([value]);
  }

  get value(): T | T[] | undefined {
    switch (this.items.size) {
    case 0: return;
    case 1: return this.items[Symbol.iterator]().next().value;
    default: return [...this.items];
    }
  }

  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }

  add(...items: T[]): this {
    items.forEach(item => this.items.add(item));
    return this;
  }

  get size(): number {
    return this.items.size;
  }

  merge(items: T[] | T | undefined): this {
    if (items == null) {
      return this;
    }
    if (Array.isArray(items)) {
      return this.add(...items);
    }
    return this.add(items);
  }

}
