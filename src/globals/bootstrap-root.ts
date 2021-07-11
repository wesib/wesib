import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { BootstrapWindow } from './bootstrap-window';

/**
 * A window (e.g. DOM) element all bootstrapped components belong to.
 *
 * @category Core
 */
export type BootstrapRoot = Element;

/**
 * Bootstrap context entry containing bootstrap root as its value.
 *
 * Target value defaults to document body of {@link BootstrapWindow}.
 *
 * @category Core
 */
export const BootstrapRoot: CxEntry<BootstrapRoot> = {
  perContext: (/*#__PURE__*/ cxSingle({
    byDefault: target => target.get(BootstrapWindow).document.body,
  })),
  toString: () => '[BootstrapRoot]',
};
