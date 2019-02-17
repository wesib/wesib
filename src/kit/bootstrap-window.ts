import { ContextKey, SingleContextKey } from 'context-values';

/**
 * A window the components bootstrap is performed against.
 */
export type BootstrapWindow = Window;

const KEY = /*#__PURE__*/ new SingleContextKey('window', () => window);

export const BootstrapWindow = {

  /**
   * A key of bootstrap context value containing a window instance the bootstrap is performed against.
   *
   * Target value defaults to current window.
   */
  get key(): ContextKey<BootstrapWindow> {
    return KEY;
  }

};
