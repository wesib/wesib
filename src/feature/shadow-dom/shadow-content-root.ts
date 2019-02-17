import { ContextKey, SingleContextKey } from 'context-values';

/**
 * Component shadow content root.
 */
export type ShadowContentRoot = ShadowRoot;

const KEY = /*#__PURE__*/ new SingleContextKey<ShadowContentRoot>('shadow-content-root');

export const ShadowContentRoot = {

  /**
   * A key of component context value containing a shadow content root instance.
   *
   * This is only available when the component is decorated with `@AttachShadow` decorator.
   */
  get key(): ContextKey<ShadowContentRoot> {
    return KEY;
  }

};
