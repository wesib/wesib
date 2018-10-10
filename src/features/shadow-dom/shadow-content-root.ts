import { ContextValueKey, SingleValueKey } from '../../common';

/**
 * Component shadow content root.
 */
export type ShadowContentRoot = ShadowRoot;

export namespace ShadowContentRoot {

  /**
   * A key of component context value containing a shadow content root instance.
   *
   * This is only available when the component is decorated with `@AttachShadow` decorator.
   */
  export const key: ContextValueKey<ShadowContentRoot> = new SingleValueKey('shadow-root');

}
