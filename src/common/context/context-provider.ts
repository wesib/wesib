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
export type ContextProvider<C, S> = <T extends C>(this: void, context: T) => S | null | undefined;

/**
 * A registry of context value providers.
 *
 * @param C The type of context.
 */
export class ContextValueRegistry<C> {

  private readonly _providers = new Map<ContextValueKey<any>, ContextProvider<C, any>[]>();

  /**
   * Registers provider for the values with the given key.
   *
   * @param <S> A type of source value.
   * @param key Context value key.
   * @param provider Context value provider.
   */
  provide<S>(key: ContextValueKey<any, S>, provider: ContextProvider<C, S>): void {

    let providers: ContextProvider<C, S>[] | undefined = this._providers.get(key);

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

    const providers: ContextProvider<C, S>[] | undefined = this._providers.get(key);

    if (!providers) {
      return key.defaultValue;
    }

    return key.merge({
      [Symbol.iterator]: provideValues(context, providers),
      reverse() {
        return provideValues(context, providers.reverse())();
      }
    });
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

function provideValues<C, S>(context: C, providers: Iterable<ContextProvider<C, S>>) {
  return function*() {
    for (const provider of providers) {

      const sourceValue = provider(context);

      if (sourceValue != null) {
        yield sourceValue;
      }
    }
  };
}
