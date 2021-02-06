import { FnContextKey, FnContextRef } from '@proc7ts/context-values/updatable';
import { ComponentContext } from '../../component';
import { ShadowContentDef } from './attach-shadow.decorator';
import { ShadowDomEvent } from './shadow-dom-event';

/**
 * Shadow root builder function type.
 *
 * An instance of this function is available in component context and is used by {@link AttachShadow @AttachShadow}
 * decorator to attach shadow root to decorated component's custom element.
 *
 * By default, if shadow root already exists for the component's element, it uses one.
 *
 * Dispatches a `wesib:shadowAttached` event for the found or attached shadow root.
 *
 * @category Feature
 */
export type ShadowRootBuilder =
/**
 * @param context - Target component context.
 * @param init - Shadow root initialization options.
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
        {
          byDefault() {
            return attachShadow;
          },
        },
    )
);

/**
 * @internal
 */
function attachShadow(context: ComponentContext, init: ShadowRootInit): ShadowRoot | undefined {

  const element = context.element as Element;
  const shadowRoot = shadowRootOf(element, init);

  if (shadowRoot) {
    context.whenConnected(() => context.dispatchEvent(new ShadowDomEvent(
        'wesib:shadowAttached',
        { bubbles: true },
    )));
  }

  return shadowRoot;
}

/**
 * @internal
 */
function shadowRootOf(element: Element, init: ShadowRootInit): ShadowRoot | undefined {

  const existing = element.shadowRoot;

  if (existing) {
    // Shadow root already attached. Using it.
    return existing;
  }
  if ('attachShadow' in element) {
    return element.attachShadow(init);
  }

  return; // Unable to attach shadow root.
}

