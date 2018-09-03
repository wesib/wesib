import { ContextValueKey } from './context-value-key';

/**
 * Context value provider.
 *
 * It is responsible for constructing the values associated with particular key for the given context. Note that
 * provider generates source value, not the context values themselves.
 *
 * @param <C> The type of context.
 * @param <S> The type of source value.
 * @param context Target component context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
export type ContextProvider<C, S> = <T extends C>(this: void, context: T) => S | null | undefined;

/**
 * A registry of context value providers.
 *
 * @param C The type of context.
 */
export class ContextProviderRegistry<C> {

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

    return key.merge((function* () {
      for (const provider of providers) {

        const sourceValue = provider(context);

        if (sourceValue != null) {
          yield sourceValue;
        }
      }
    })());
  }

}
