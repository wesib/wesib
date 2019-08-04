/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';
import { ComponentContext } from '../../component';
import { ShadowContentDef } from './shadow-content-def';

/**
 * Shadow root builder function type.
 *
 * An instance of this function is available in component context under `ShadowRootBuilder.key` and is used
 * by `@AttachShadow()` decorator to attach shadow root to decorated component's custom element.
 *
 * By default, if shadow root already exists for the component's element, it uses it.
 *
 * Dispatches a `wesib:shadowAttached` event for the found or attached shadow root.
 *
 * @param context  Target component context.
 * @param init  Shadow root initialization options.
 *
 * @returns A shadow root instance for target component, or `null`/`undefined` if one can not be attached.
 */
export type ShadowRootBuilder =
    <T extends object>(context: ComponentContext<T>, init: ShadowContentDef) => ShadowRoot | null | undefined;

/**
 * A key of component context value containing a shadow root builder instance.
 */
export const ShadowRootBuilder: ContextTarget<ShadowRootBuilder> & ContextRequest<ShadowRootBuilder> =
    /*#__PURE__*/ new SingleContextKey<ShadowRootBuilder>('shadow-root-builder');
