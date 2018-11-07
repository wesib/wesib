import { ContextRequest, ContextSources, ContextTarget } from './context-value';
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

export type ContextValueProvider<C extends ContextValues, S> =
    (this: void, context: C) => S | null | undefined;

/**
 * A provider of context value sources.
 *
 * @param <C> A type of context.
 * @param provide A definition of provided context value.
 * @param context Target context.
 *
 * @returns Context value sources associated with the given key provided for the given context.
 */
export type ContextSourcesProvider<C extends ContextValues> =
    <S>(this: void, provide: ContextTarget<S>, context: C) => ContextSources<S>;

/**
 * Context value specifier.
 */
export type ContextValueSpec<C extends ContextValues, V, D extends any[] = unknown[], S = V> =
    ContextValueSpec.IsConstant<C, V, S>
    | ContextValueSpec.ByProvider<C, V, S>
    | ContextValueSpec.ByProviderWithDeps<C, V, D, S>;

export namespace ContextValueSpec {

  /**
   * A specifier defining a context value is constant.
   */
  export interface IsConstant<C extends ContextValues, V, S = V> {

    /**
     * Target value to define.
     */
    a: ContextTarget<S>;

    /**
     * Constant context value.
     */
    is: S;

  }

  /**
   * A specifier of context value defined by provider.
   */
  export interface ByProvider<C extends ContextValues, V, S = V> {

    /**
     * Target value to define.
     */
    a: ContextTarget<S>;

    /**
     * Context value provider.
     */
    by: ContextValueProvider<C, S>;

  }

  export interface ByProviderWithDeps<C extends ContextValues, V, D extends any[], S = V> {

    /**
     * Target value to define.
     */
    a: ContextTarget<S>;

    /**
     * Context value provider function.
     */
    by: (this: void, ...args: D) => S | null | undefined;

    /**
     * Context value requests for corresponding value provider function arguments.
     */
    with: DepsRequests<D>;

  }

  export type DepsRequests<P extends any[]> = {
    [index in keyof P]: ContextRequest<P[index]>;
  };

  function isConstant<C extends ContextValues, V, D extends any[], S>(
      spec: ContextValueSpec<C, V, D, S>): spec is IsConstant<C, V, S> {
    return 'is' in spec;
  }

  function withDeps<C extends ContextValues, D extends any[], V, S>(
      spec: ByProviderWithDeps<C, V, D, S> | ByProvider<C, V, S>): spec is ByProviderWithDeps<C, V, D, S>;
  function withDeps<C extends ContextValues, D extends any[], V, S>(spec: ContextValueSpec<C, V, D, S>): boolean {
    return 'with' in spec;
  }

  /**
   * Constructs a specifier of context value defined by provider out of arbitrary one.
   *
   * @param spec Context value specifier to convert.
   */
  export function of<C extends ContextValues, V, D extends any[], S = V>(
      spec: ContextValueSpec<C, V, D, S>): ByProvider<C, V, S> {
    if (isConstant(spec)) {
      return {
        a: spec.a,
        by: () => spec.is,
      };
    }
    if (!withDeps(spec)) {
      return spec;
    }

    const by: (this: void, ...args: D) => S | null | undefined = spec.by;
    const deps: DepsRequests<D> = spec.with;

    return {
      a: spec.a,
      by(this: void, context: C) {
        function dep<T>(request: ContextRequest<T>): T {
          return context.get(request);
        }
        return by(...deps.map(dep) as D);
      },
    };
  }

}
