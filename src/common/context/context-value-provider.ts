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
    ContextValueSpec.IsConstant<S>
    | ContextValueSpec.ViaAlias<S>
    | ContextValueSpec.ByProvider<C, V, S>
    | ContextValueSpec.ByProviderWithDeps<V, D, S>;

export namespace ContextValueSpec {

  /**
   * A specifier defining a context value is constant.
   */
  export interface IsConstant<S> {

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
   * A specifier defining a context value via another one (alias).
   */
  export interface ViaAlias<S> {

    /**
     * Target value to define.
     */
    a: ContextTarget<S>;

    /**
     * Context value request for the another value that will be used instead as provided one.
     */
    via: ContextRequest<S>;

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

  export interface ByProviderWithDeps<V, D extends any[], S = V> {

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

  function byProvider<C extends ContextValues, V, D extends any[], S>(
      spec: ContextValueSpec<C, V, D, S>): spec is ByProvider<C, V, S> | ByProviderWithDeps<V, D, S> {
    return 'by' in spec;
  }

  function isConstant<C extends ContextValues, V, D extends any[], S>(
      spec: ContextValueSpec<C, V, D, S>): spec is IsConstant<S> {
    return 'is' in spec;
  }

  function viaAlias<C extends ContextValues, V, D extends any[], S>(
      spec: ContextValueSpec<C, V, D, S>): spec is ViaAlias<S> {
    return 'via' in spec;
  }

  function withDeps<C extends ContextValues, D extends any[], V, S>(
      spec: ByProvider<C, V, S> | ByProviderWithDeps<V, D, S>): spec is ByProviderWithDeps<V, D, S>;
  function withDeps<C extends ContextValues, D extends any[], V, S>(spec: ContextValueSpec<C, V, D, S>): boolean {
    return 'with' in spec;
  }

  /**
   * Constructs a specifier of context value defined by provider out of arbitrary one.
   *
   * @param spec Context value specifier to convert.
   *
   * @throws TypeError On malformed context value specifier.
   */
  export function of<C extends ContextValues, V, D extends any[], S = V>(
      spec: ContextValueSpec<C, V, D, S>): ByProvider<C, V, S> {
    if (byProvider(spec)) {
      if (!withDeps(spec)) {
        return spec;
      }

      const { by, with: deps } = spec;

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
    if (isConstant(spec)) {
      return {
        a: spec.a,
        by: () => spec.is,
      };
    }
    if (viaAlias(spec)) {

      const { via } = spec;

      return {
        a: spec.a,
        by: (ctx) => ctx.get(via),
      };
    }

    throw new TypeError(`Malformed context value specifier: ${spec}`);
  }

}
