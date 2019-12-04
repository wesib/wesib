/**
 * @module @wesib/wesib
 */
import { SingleContextKey, SingleContextRef } from 'context-values';

/**
 * A window the components bootstrap is performed against.
 *
 * @category Core
 */
export type BootstrapWindow = Window & typeof globalThis;

/**
 * A key of bootstrap context value containing a window instance the bootstrap is performed against.
 *
 * Target value defaults to current window.
 *
 * @category Core
 */
export const BootstrapWindow: SingleContextRef<BootstrapWindow> = /*#__PURE__*/ new SingleContextKey(
    'window',
    {
      byDefault() {
        return window;
      },
    },
);
