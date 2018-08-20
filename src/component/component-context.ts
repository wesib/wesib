/**
 * Web component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * @param <E> A type of HTML element.
 */
export interface ComponentContext<E extends HTMLElement = HTMLElement> {

  /**
   * Custom HTML element constructed for the component according to its type.
   */
  readonly element: E;

  /**
   * Returns a `super` property value inherited from custom HTML element parent.
   *
   * @param name Target property name.
   */
  elementSuper(name: string): any;

  get<V>(key: ComponentValueKey<V>, defaultValue?: V): V;

  get<V>(key: ComponentValueKey<V>, defaultValue: V | null): V | null;

  get<V>(key: ComponentValueKey<V>, defaultValue: V | undefined): V | undefined;

  /**
   * Returns a value associated with the given key.
   *
   * Values are provided by corresponding providers registered with `Components.provide()` method.
   *
   * @param <V> The type of associated value.
   * @param key Target key.
   * @param defaultValue Default value to return if there is no value associated with the given key. Can be `null`
   * or `undefined` too.
   *
   * @returns Associated value.
   *
   * @throws Error If there is no value associated with the given key and the default key is not provided.
   */
  get<V>(key: ComponentValueKey<V>, defaultValue: V | null | undefined): V | null | undefined;

}

/**
 * Component value key.
 *
 * Every key should be an unique instance of this class.
 *
 * @param <V> The type of associated value.
 */
export class ComponentValueKey<V> {

  /**
   * Human-readable key name.
   *
   * This is not necessary unique.
   */
  readonly name: string;

  /**
   * Constructs component context key.
   *
   * @param name Human-readable key name.
   */
  constructor(name: string) {
    this.name = name;
  }

  toString(): string {
    return this.name;
  }

}

/**
 * Component value provider.
 *
 * It is responsible for constructing the values associated with particular key for each component.
 *
 * This function is called at most once per component, unless it returns `null`/`undefined`. In the latter case
 * it may be called again later.
 *
 * @param <V> The type of associated value.
 * @param context Target component context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
export type ComponentValueProvider<V> = <E extends HTMLElement>(context: ComponentContext<E>) => V | null | undefined;
