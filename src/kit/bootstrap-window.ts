import { ContextKey, SingleContextKey } from 'context-values';

/**
 * A window the components bootstrap is performed against.
 */
export type BootstrapWindow = Window;

export namespace BootstrapWindow {

  /**
   * A key of bootstrap context value containing a window instance the bootstrap is performed against.
   *
   * Target value defaults to current window.
   */
  export const key: ContextKey<BootstrapWindow> = new SingleContextKey('window', () => window);

}
