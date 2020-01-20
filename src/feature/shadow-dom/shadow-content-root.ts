/**
 * @module @wesib/wesib
 */
import { SingleContextKey, SingleContextRef } from 'context-values';

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
export const ShadowContentRoot: SingleContextRef<ShadowContentRoot> = (
    /*#__PURE__*/ new SingleContextKey<ShadowContentRoot>('shadow-content-root')
);
