/**
 * Context value key.
 *
 * Every key should be an unique instance of this class.
 *
 * Multiple source values can be provided internally per value key. Then they are merged with `ContextValueKey.merge()`
 * method into single context value.
 *
 * @param <V> The type of associated value.
 * @param <S> The type of source values.
 */
export abstract class ContextValueKey<V, S = V> {

  /**
   * Human-readable key name.
   *
   * This is not necessarily unique.
   */
  readonly name: string;

  /**
   * The value used when there is no value associated with this key.
   *
   * If `undefined`, then there is no default value.
   */
  readonly defaultValue: V | undefined;

  /**
   * Constructs component context key.
   *
   * @param name Human-readable key name.
   * @param defaultValue Optional default value. If unspecified or `undefined` the key has no default value.
   */
  protected constructor(name: string, defaultValue?: V) {
    this.name = name;
    this.defaultValue = defaultValue;
  }

  /**
   * Merges multiple source values into one context value.
   *
   * @param sourceValues An iterator of source values to merge.
   *
   * @returns Single context value.
   */
  abstract merge(sourceValues: Iterator<S>): V | undefined;

  toString(): string {
    return `ContextValueKey(${this.name})`;
  }

}

/**
 * Single context value key.
 *
 * This context value key treats the first source value as context one and ignores the rest of them.
 *
 * @param <V> The type of associated value.
 * @param <S> The type of source values.
 */
export class SingleValueKey<V> extends ContextValueKey<V> {

  constructor(name: string, defaultValue?: V) {
    super(name, defaultValue);
  }

  /**
   * Merges multiple source values into one context value.
   *
   * @param sourceValues Source values to merge.
   *
   * @returns Single source value.
   *
   * @throws Error If more than one source value provided.
   */
  merge(sourceValues: Iterator<V>): V | undefined {
    return sourceValues.next().value;
  }

}
