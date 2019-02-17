import { ContextKey, SingleContextKey } from 'context-values';
import { BootstrapWindow } from './bootstrap-window';

/**
 * A window (e.g. DOM) element all bootstrapped components belong to.
 */
export type BootstrapRoot = any;

const KEY = /*#__PURE__*/ new SingleContextKey('bootstrap-root', ctx => ctx.get(BootstrapWindow).document.body);

export const BootstrapRoot = {

  /**
   * A key of bootstrap context value containing a bootstrap root.
   *
   * Target value defaults to document body of `BootstrapWindow`.
   */
  get key(): ContextKey<BootstrapRoot> {
    return KEY;
  }

};
