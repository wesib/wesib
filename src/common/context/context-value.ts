import { RevertibleIterable } from '../iteration';
import { ContextValues } from './context-values';

/**
 * Context value key.
 *
 * Every key should be an unique instance of this class.
 *
 * Multiple source values can be provided internally per value key. Then they are merged with `ContextValueKey.merge()`
 * method into single context value.
 *
 * @param <V> A type of associated value.
 * @param <S> A type of source values.
 */
export abstract class ContextValueKey<V, S = V> {

  /**
   * Human-readable key name.
   *
   * This is not necessarily unique.
   */
  readonly name: string;

  /**
   * Constructs context key.
   *
   * @param name Human-readable key name.
   */
  protected constructor(name: string) {
    this.name = name;
  }

  /**
   * Merges multiple source values into one context value.
   *
   * @param context Context values.
   * @param sourceValues An iterable of source values to merge.
   * @param handleDefault Default value handler. The default values should be passed through it.
   *
   * @returns Single context value, or `undefined` if there is no default value.
   */
  abstract merge(
      context: ContextValues,
      sourceValues: RevertibleIterable<S>,
      handleDefault: ContextValueDefaultHandler<V>): V | null | undefined;

  toString(): string {
    return `ContextValueKey(${this.name})`;
  }

}

/**
 * Default context value handler.
 *
 * It is called from `ContextValueKey.merge()` operation to handle default values.
 *
 * It is responsible for default value selection. As explicitly specified default value should always take precedence
 * over the one specified in the value key.
 *
 * @param <V> A type of context value key.
 * @param defaultProvider Default value provider. It is called only when the default value is not provided explicitly.
 * If it returns a non-null/non-undefined value, then it will be associated with context key.
 *
 * @return Default value to return.
 *
 * @throws Error If there is no explicitly specified default value, and `defaultProvider` did not provide any value.
 */
export type ContextValueDefaultHandler<V> = (defaultProvider: () => V | null | undefined) => V | null | undefined;

/**
 * Single context value key.
 *
 * Treats the last source value as context one and ignores the rest of them.
 *
 * @param <V> The type of associated value.
 * @param <S> The type of source values.
 */
export class SingleValueKey<V> extends ContextValueKey<V> {

  /**
   * A provider of context value used when there is no value associated with this key.
   *
   * If `undefined`, then there is no default value.
   */
  readonly defaultProvider: (context: ContextValues) => V | null | undefined;

  /**
   * Constructs single context value key.
   *
   * @param name Human-readable key name.
   * @param defaultProvider Optional default value provider. If unspecified or `undefined` the key has no default value.
   */
  constructor(name: string, defaultProvider: (context: ContextValues) => V | null | undefined = () => undefined) {
    super(name);
    this.defaultProvider = defaultProvider;
  }

  merge(
      context: ContextValues,
      sourceValues: RevertibleIterable<V>,
      handleDefault: ContextValueDefaultHandler<V>): V | null | undefined {

    const value = sourceValues.reverse()[Symbol.iterator]().next().value;

    if (value != null) {
      return value;
    }

    return handleDefault(() => this.defaultProvider(context));
  }

}

/**
 * Multiple context values key.
 *
 * Represents context value as array of source values.
 *
 * Associated with empty array by default.
 *
 * @param <V> The type of associated value.
 * @param <S> The type of source values.
 */
export class MultiValueKey<V> extends ContextValueKey<V[], V> {

  /**
   * A provider of context value used when there is no value associated with this key.
   */
  readonly defaultProvider: ContextValueProvider<ContextValues, V[]>;

  /**
   * Constructs multiple context values key.
   *
   * @param name Human-readable key name.
   * @param defaultProvider Optional default value provider. If unspecified then the default value is empty array.
   */
  constructor(name: string, defaultProvider: ContextValueProvider<ContextValues, V[]> = () => []) {
    super(name);
    this.defaultProvider = defaultProvider;
  }

  merge(
      context: ContextValues,
      sourceValues: RevertibleIterable<V>,
      handleDefault: ContextValueDefaultHandler<V[]>): V[] | null | undefined {

    const result = [...sourceValues];

    if (result.length) {
      return result;
    }

    return handleDefault(() => {

      const defaultSources = this.defaultProvider(context);

      if (defaultSources) {
        return [...defaultSources];
      }

      return;
    });
  }

}

/**
 * Context value provider.
 *
 * It is responsible for constructing the values associated with particular key for the given context. Note that
 * provider generates source value, not the context values themselves.
 *
 * @param <C> The type of context.
 * @param <S> The type of source value.
 * @param context Target context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
export type ContextValueProvider<C extends ContextValues, S> =
    <T extends C>(this: void, context: T) => S | null | undefined;

/**
 * The source of context values.
 *
 * @param <C> A type of context.
 * @param key Context value key.
 * @param context Target context.
 *
 * @returns Revertible iterable of context value sources associated with the given key provided for the given context.
 */
export type ContextValueSource<C extends ContextValues> =
    <V, S>(this: void, key: ContextValueKey<V, S>, context: C) => RevertibleIterable<S>;

/**
 * Context value specifier.
 */
export type ContextValueSpec<C extends ContextValues, V, S = V> =
    ContextValueDef<C, V, S>
    | ContextConstDef<C, V, S>;

/**
 * Context value definition.
 *
 * Defines a `provider` for the value with the given `key`.
 */
export interface ContextValueDef<C extends ContextValues, V, S = V> {

  /**
   * Context value key the `provider` provides value for.
   */
  key: ContextValueKey<V, S>;

  /**
   * Context value provider.
   */
  provider: ContextValueProvider<C, S>;

}

/**
 * Context constant definition.
 *
 * Defines a source `value` for context value with the given `key`.
 */
export interface ContextConstDef<C extends ContextValues, V, S = V> {

  /**
   * Context value key the `provider` provides value for.
   */
  key: ContextValueKey<V, S>;

  /**
   * Context value source.
   */
  value: S;

}

export namespace ContextValueDef {

  /**
   * Constructs context value definition by context value specifier.
   *
   * @param spec Context value specifier to convert to definition.
   *
   * @returns Context value definition of the specified value.
   */
  export function of<C extends ContextValues, V, S = V>(spec: ContextValueSpec<C, V, S>) {
    if (isConst(spec)) {
      return {
        key: spec.key,
        provider: () => spec.value,
      };
    }
    return spec;
  }

}

function isConst<C extends ContextValues, V, S = V>(
    spec: ContextValueSpec<any, any, any>): spec is ContextConstDef<C, V, S> {
  return 'value' in spec;
}
