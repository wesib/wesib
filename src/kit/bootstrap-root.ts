import { ContextKey, SingleContextKey } from 'context-values';
import { BootstrapWindow } from './bootstrap-window';

/**
 * A window (e.g. DOM) element all bootstrapped components belong to.
 */
export type BootstrapRoot = any;

export namespace BootstrapRoot {

  /**
   * A key of bootstrap context value containing a bootstrap root.
   *
   * Target value defaults to document body of `BootstrapWindow`.
   */
  export const key: ContextKey<BootstrapRoot> =
      new SingleContextKey('bootstrap-root', ctx => ctx.get(BootstrapWindow).document.body);

}
