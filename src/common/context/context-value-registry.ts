import { RevertibleIterable } from '../iteration';
import { ContextValueDefaultHandler, ContextValueKey, ContextValueProvider, ContextValueSource } from './context-value';
import { ContextValues } from './context-values';

/**
 * A registry of context value providers.
 *
 * @param <C> A type of context.
 */
export class ContextValueRegistry<C extends ContextValues> {

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
   * @param handleDefault Default value handler.
   *
   * @returns Either constructed value, or `null`/`undefined` if the value can not be constructed.
   */
  get<V, S>(
      key: ContextValueKey<V, S>,
      context: C,
      handleDefault: ContextValueDefaultHandler<V>): V | null | undefined {
    return key.merge(context, this.sources(context, key), handleDefault);
  }

  /**
   * Returns the value sources provided for the given key.
   *
   * @param key Context value key.
   * @param context Context to provide value for.
   *
   * @returns A revertible iterable of the value sources associated with the given key.
   */
  sources<V, S>(context: C, key: ContextValueKey<V, S>): RevertibleIterable<S> {
    return this.bindSources(context)(key);
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

      get<V, S>(this: C, key: ContextValueKey<V, S>, defaultValue?: V | null | undefined): V | null | undefined {

        const cached: V | undefined = values.get(key);

        if (cached != null) {
          return cached;
        }

        let defaultUsed = false;
        const handleDefault: ContextValueDefaultHandler<V> =
            arguments.length > 1
                ? () => {
                  defaultUsed = true;
                  return defaultValue;
                } : defaultProvider => {

                  const providedDefault = defaultProvider();

                  if (providedDefault == null) {
                    throw new Error(`There is no value with the key ${key}`);
                  }

                  return providedDefault;
                };

        const constructed = providerRegistry.get(key, this, handleDefault);

        if (!defaultUsed) {
          values.set(key, constructed);
        }

        return constructed;
      }

    }

    return new Values();
  }

  /**
   * Appends values provided by another value registry to the ones provided by this one.
   *
   * @param other Another context value registry.
   *
   * @return New context value registry which values provided by both registries.
   */
  append(other: ContextValueRegistry<C>): ContextValueRegistry<C> {

    const self = this;

    return new ContextValueRegistry<C>(<V, S>(
        key: ContextValueKey<V, S>,
        context: C) => ({
      [Symbol.iterator]: function* () {
        yield* self.sources(context, key);
        yield* other.sources(context, key);
      },
      reverse() {
        return {
          [Symbol.iterator]: function* () {
            yield* other.sources(context, key).reverse();
            yield* self.sources(context, key).reverse();
          }
        };
      },
    }));
  }

}

function* valueSources<C extends ContextValues, S>(
    context: C,
    providers: Iterable<ContextValueProvider<C, S>>): Iterable<S> {
  for (const provider of providers) {

    const sourceValue = provider(context);

    if (sourceValue != null) {
      yield sourceValue;
    }
  }
}
