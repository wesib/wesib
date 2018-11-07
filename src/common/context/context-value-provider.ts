import { ContextSources, ContextTarget } from './context-value';
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
    <T extends C>(this: void, context: T) => S | null | undefined;

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
export type ContextValueSpec<C extends ContextValues, V, S = V> =
    ContextValueSpec.ByProvider<C, V, S>
    | ContextValueSpec.IsConstant<C, V, S>;

export namespace ContextValueSpec {

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

  function isConstant<C extends ContextValues, V, S = V>(
      spec: ContextValueSpec<any, any, any>): spec is IsConstant<C, V, S> {
    return 'is' in spec;
  }

  /**
   * Constructs a specifier of context value defined by provider out of arbitrary one.
   *
   * @param spec Context value specifier to convert.
   */
  export function of<C extends ContextValues, V, S = V>(spec: ContextValueSpec<C, V, S>): ByProvider<C, V, S> {
    if (isConstant(spec)) {
      return {
        a: spec.a,
        by: () => spec.is,
      };
    }
    return spec;
  }

}
