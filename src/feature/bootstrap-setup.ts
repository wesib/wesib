/**
 * @module @wesib/wesib
 */
import { ContextValueSpec } from 'context-values';
import { BootstrapContext } from '../boot';

/**
 * Bootstrap context setup.
 *
 * It is passed to [[FeatureDef.setup]] method to set up bootstrap context. E.g. by providing bootstrap context value.
 */
export interface BootstrapSetup {

  /**
   * Provides bootstrap context value before context creation.
   *
   * @typeparam Deps  Dependencies tuple type.
   * @typeparam Src  Source value type.
   * @typeparam Seed  Value seed type.
   * @param spec  Context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  provide<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<BootstrapContext, any, Deps, Src, Seed>,
  ): () => void;

}
