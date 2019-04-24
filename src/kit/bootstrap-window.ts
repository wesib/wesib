import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';

/**
 * A window the components bootstrap is performed against.
 */
export type BootstrapWindow = Window;

/**
 * A key of bootstrap context value containing a window instance the bootstrap is performed against.
 *
 * Target value defaults to current window.
 */
export const BootstrapWindow: ContextTarget<BootstrapWindow> & ContextRequest<BootstrapWindow> =
    /*#__PURE__*/ new SingleContextKey('window', () => window);
