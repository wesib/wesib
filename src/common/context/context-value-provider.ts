import { RevertibleIterable } from '../iteration';
import { ContextValueKey } from './context-value-key';
import { ContextValues } from './context-values';

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
export type ContextValueProvider<C, S> = <T extends C>(this: void, context: T) => S | null | undefined;

/**
 * The source of context values.
 *
 * @param <C> A type of context.
 * @param key Context value key.
 * @param context Target context.
 *
 * @returns Revertible iterable of context value sources associated with the given key provided for the given context.
 */
export type ContextValueSource<C> =
    <V, S>(this: void, key: ContextValueKey<V, S>, context: C) => RevertibleIterable<S>;

/**
 * A registry of context value providers.
 *
 * @param <C> A type of context.
 */
export class ContextValueRegistry<C> {

  private readonly _providers = new Map<ContextValueKey<any>, ContextValueProvider<C, any>[]>();
  private readonly _initial: ContextValueSource<C>;

  /**
   * Constructs a registry for context value providers.
   *
   * @param initial An optional source of initially known context values. This is useful e.g. for chaining
   * registries.
   */
  constructor(initial: ContextValueSource<C> = () => []) {
    this._initial = initial;
  }

  /**
   * Registers provider for the values with the given key.
   *
   * @param <S> A type of source value.
   * @param key Context value key.
   * @param provider Context value provider.
   */
  provide<S>(key: ContextValueKey<any, S>, provider: ContextValueProvider<C, S>): void {

    let providers: ContextValueProvider<C, S>[] | undefined = this._providers.get(key);

    if (providers == null) {
      providers = [provider];
      this._providers.set(key, providers);
    } else {
      providers.push(provider);
    }
  }

  /**
   * Returns the value provided for the given key.
   *
   * @param key Context value key.
   * @param context Context to provide value for.
   *
   * @returns Either constructed value, or `null`/`undefined` if the value can not be constructed.
   */
  get<V, S>(key: ContextValueKey<V, S>, context: C): V | null | undefined {
    return key.merge(this.bindSources(context)(key));
  }

  /**
   * Binds value sources to the given context.
   *
   * @param context Target value context.
   *
   * @returns A provider of context value sources bound to the given context.
   */
  bindSources(context: C): <V, S>(this: void, key: ContextValueKey<V, S>) => RevertibleIterable<S> {
    return <V, S>(key: ContextValueKey<V, S>) => {

      const sources = this._initial(key, context);
      const providers: ContextValueProvider<C, S>[] = this._providers.get(key) || [];

      return {
        [Symbol.iterator]: function* () {
          yield* sources;
          yield* valueSources(context, providers);
        },
        reverse: function* () {
          yield* valueSources(context, providers.reverse());
          yield* sources.reverse();
        },
      };
    };
  }

  /**
   * Creates new context values instance consulting this registry for value providers.
   *
   * @returns New context values instance which methods treat `this` instance as target context the values
   * provided for.
   */
  newValues(): ContextValues & ThisType<C> {

    const values = new Map<ContextValueKey<any>, any>();
    const providerRegistry = this;

    class Values implements ContextValues {

      get<V>(this: C, key: ContextValueKey<V>): V;

      get<V>(this: C, key: ContextValueKey<V>, defaultValue?: V | null | undefined): V | null | undefined {

        const cached: V | undefined = values.get(key);

        if (cached != null) {
          return cached;
        }

        const constructed = providerRegistry.get(key, this);

        if (constructed != null) {
          values.set(key, constructed);
          return constructed;
        }
        if (arguments.length > 1) {
          return defaultValue;
        }

        throw new Error(`There is no value with the key ${key}`);
      }
    }

    return new Values();
  }

}

function* valueSources<C, S>(context: C, providers: Iterable<ContextValueProvider<C, S>>): Iterable<S> {
  for (const provider of providers) {

    const sourceValue = provider(context);

    if (sourceValue != null) {
      yield sourceValue;
    }
  }
}
