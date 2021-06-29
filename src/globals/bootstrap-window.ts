import { CxEntry, cxSingle } from '@proc7ts/context-values';

/**
 * A window the components bootstrap is performed against.
 *
 * @category Core
 */
export type BootstrapWindow = Window & typeof globalThis;

/**
 * Bootstrap context entry containing a window instance the bootstrap is performed against.
 *
 * Defaults to current window.
 *
 * @category Core
 */
export const BootstrapWindow: CxEntry<BootstrapWindow> = {
  perContext: (/*#__PURE__*/ cxSingle({ byDefault: () => window })),
};
