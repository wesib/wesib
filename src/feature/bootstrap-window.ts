import { ContextValueKey, SingleValueKey } from '../common/context';

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
  export const key: ContextValueKey<BootstrapWindow> = new SingleValueKey('window', () => window);

}
