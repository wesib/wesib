/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';

/**
 * Component shadow content root.
 *
 * @category Feature
 */
export type ShadowContentRoot = ShadowRoot;

/**
 * A key of component context value containing a shadow content root instance.
 *
 * This is only available when the component is decorated with {@link AttachShadow @AttachShadow} decorator.
 *
 * @category Feature
 */
export const ShadowContentRoot:
    ContextTarget<ShadowContentRoot> & ContextRequest<ShadowContentRoot> =
    /*#__PURE__*/ new SingleContextKey<ShadowContentRoot>('shadow-content-root');
