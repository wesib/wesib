/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';
import { BootstrapWindow } from './bootstrap-window';

/**
 * A window (e.g. DOM) element all bootstrapped components belong to.
 *
 * @category Core
 */
export type BootstrapRoot = any;

/**
 * A key of bootstrap context value containing a bootstrap root.
 *
 * Target value defaults to document body of [[BootstrapWindow]].
 *
 * @category Core
 */
export const BootstrapRoot: ContextTarget<BootstrapRoot> & ContextRequest<BootstrapRoot> =
    /*#__PURE__*/ new SingleContextKey('bootstrap-root', ctx => ctx.get(BootstrapWindow).document.body);
