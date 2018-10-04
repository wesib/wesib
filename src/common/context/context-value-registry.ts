import { RevertibleIterable } from '../iteration';
import {
  ContextValueDefaultHandler,
  ContextValueKey,
  ContextValueProvider,
  ContextValueSource,
  ContextValueSourcesKey,
} from './context-value';
import { ContextValues } from './context-values';

/**
 * A registry of context value providers.
 *
 * @param <C> A type of context.
 */
export class ContextValueRegistry<C extends ContextValues> {

  /** @internal */
  private readonly _initial: ContextValueSource<C>;

  /** @internal */
  private readonly _providers = new Map<ContextValueSourcesKey<any>, ContextValueProvider<C, any>[]>();

  /** @internal */
  private _nonCachedValues?: ContextValues;

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

    const sourcesKey = key.sourcesKey;
    let providers: ContextValueProvider<C, S>[] | undefined = this._providers.get(sourcesKey);

    if (providers == null) {
      providers = [provider];
      this._providers.set(sourcesKey, providers);
    } else {
      providers.push(provider);
    }
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
    return this.bindSources(context, false)(key);
  }

  /**
   * Binds value sources to the given context.
   *
   * @param context Target value context.
   * @param cache Whether to cache context values. When `false` the value providers may be called multiple times.
   *
   * @returns A provider of context value sources bound to the given context.
   */
  bindSources(context: C, cache?: boolean): <V, S>(this: void, key: ContextValueKey<V, S>) => RevertibleIterable<S> {

    const values = this.newValues(cache);

    return <V, S>(key: ContextValueKey<V, S>) => values.get.call(context, key.sourcesKey);
  }

  /**
   * Creates new context values instance consulting this registry for value providers.
   *
   * @param cache Whether to cache context values. When `false` the value providers may be called multiple times.
   *
   * @returns New context values instance which methods treat `this` instance as target context the values
   * provided for.
   */
  newValues(cache = true): ContextValues & ThisType<C> {
    if (!cache && this._nonCachedValues) {
      return this._nonCachedValues;
    }

    const values = new Map<ContextValueKey<any>, any>();
    const registry = this;

    function sourcesProvidersFor<V, S>(key: ContextValueSourcesKey<S>): SourceProvider<C, S>[] {

      const providers: ContextValueProvider<C, S>[] = registry._providers.get(key) || [];

      return providers.map(provider => [provider] as SourceProvider<C, S>);
    }

    class Values implements ContextValues {

      get<V, S>(this: C, key: ContextValueKey<V, S>, defaultValue?: V | null | undefined): V | null | undefined {

        const context = this;
        const cached: V | undefined = values.get(key);

        if (cached != null) {
          return cached;
        }

        let sourceValues: RevertibleIterable<S>;

        if (key.sourcesKey !== key as any) {
          // This is not a sources key
          // Retrieve the sources by sources key
          sourceValues = context.get(key.sourcesKey);
        } else {
          // This is a sources key.
          // Find providers.
          const sourceProviders = sourcesProvidersFor(key.sourcesKey);
          const initial = registry._initial(key, context);

          sourceValues = {
            [Symbol.iterator]: function* () {
              yield* initial;
              yield* valueSources(context, sourceProviders);
            },
            reverse: function* () {
              yield* valueSources(context, sourceProviders.reverse());
              yield* initial.reverse();
            },
          };
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

        const constructed = key.merge(context, sourceValues, handleDefault);

        if (cache && !defaultUsed) {
          values.set(key, constructed);
        }

        return constructed;
      }

    }

    if (!cache) {
      return this._nonCachedValues = new Values();
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

// Context value provider and cached context value source.
type SourceProvider<C extends ContextValues, S> = [ContextValueProvider<C, S>, (S | null | undefined)?];

function* valueSources<C extends ContextValues, S>(
    context: C,
    sourceProviders: Iterable<SourceProvider<C, S>>): Iterable<S> {
  for (const sourceProvider of sourceProviders) {

    let sourceValue: S | null | undefined;

    if (sourceProvider.length > 1) {
      sourceValue = sourceProvider[1];
    } else {
      sourceValue = sourceProvider[0](context);
      sourceProvider.push(sourceValue);
    }

    if (sourceValue != null) {
      yield sourceValue;
    }
  }
}
