/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { FnContextKey, FnContextRef } from '@proc7ts/context-values/updatable';
import { ComponentContext } from '../../component';
import { ShadowContentDef } from './attach-shadow.decorator';

/**
 * Shadow root builder function type.
 *
 * An instance of this function is available in component context and is used by {@link AttachShadow @AttachShadow}
 * decorator to attach shadow root to decorated component's custom element.
 *
 * By default, if shadow root already exists for the component's element, it uses it.
 *
 * Dispatches a `wesib:shadowAttached` event for the found or attached shadow root.
 *
 * @category Feature
 */
export type ShadowRootBuilder =
/**
 * @param context  Target component context.
 * @param init  Shadow root initialization options.
 *
 * @returns A shadow root instance for target component, or `null`/`undefined` if one can not be attached.
 */
    (context: ComponentContext, init: ShadowContentDef) => ShadowRoot | null | undefined;

/**
 * A key of component context value containing a shadow root builder instance.
 *
 * @category Feature
 */
export const ShadowRootBuilder: FnContextRef<Parameters<ShadowRootBuilder>, ReturnType<ShadowRootBuilder>> = (
    /*#__PURE__*/ new FnContextKey<Parameters<ShadowRootBuilder>, ReturnType<ShadowRootBuilder>>(
        'shadow-root-builder',
    )
);
