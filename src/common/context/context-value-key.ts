/**
 * Context value key.
 *
 * Every key should be an unique instance of this class.
 *
 * @param <V> The type of associated value.
 */
export class ContextValueKey<V> {

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
  constructor(name: string, defaultValue?: V) {
    this.name = name;
    this.defaultValue = defaultValue;
  }

  toString(): string {
    return `ContextValueKey(${this.name})`;
  }

}
