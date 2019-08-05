/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';

/**
 * A window the components bootstrap is performed against.
 *
 * @category Core
 */
export type BootstrapWindow = Window;

/**
 * A key of bootstrap context value containing a window instance the bootstrap is performed against.
 *
 * Target value defaults to current window.
 *
 * @category Core
 */
export const BootstrapWindow: ContextTarget<BootstrapWindow> & ContextRequest<BootstrapWindow> =
    /*#__PURE__*/ new SingleContextKey('window', () => window);
