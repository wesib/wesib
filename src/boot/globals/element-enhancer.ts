/**
 * @module @wesib/wesib
 */
import { noop, valueProvider } from 'call-thru';
import { FnContextKey, FnContextRef } from 'context-values';

/**
 * Element enhancer is a function able to augment elements.
 *
 * Multiple element enhancers could be registered in bootstrap context. They are used as first
 * {@link ElementAdapter element adapter}, unless target element has component.
 *
 * @category Core
 */
export type ElementEnhancer =
/**
 * @param element  Target raw element to enhance.
 */
    (this: void, element: any) => void;

/**
 * A key of bootstrap context value containing combined [[ElementEnhancer]] instance.
 *
 * @category Core
 */
export const ElementEnhancer: FnContextRef<[any]> =
    /*#__PURE__*/ new FnContextKey<[any]>('element-enhancer', { byDefault: valueProvider(noop) });
