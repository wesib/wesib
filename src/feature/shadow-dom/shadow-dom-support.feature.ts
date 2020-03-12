/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ComponentContext, ComponentContext__symbol } from '../../component';
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { ShadowDomEvent } from './shadow-dom-event';
import { ShadowRootBuilder } from './shadow-root-builder';

/**
 * @internal
 */
const ShadowDomSupport__feature: FeatureDef = {
  setup(setup) {
    setup.provide({ a: ShadowRootBuilder, is: attachShadow });
  },
};

/**
 * Shadow root support feature.
 *
 * This feature is automatically enabled when {@link AttachShadow @AttachShadow} decorator is used.
 *
 * @category Feature
 */
export class ShadowDomSupport {

  static get [FeatureDef__symbol](): FeatureDef {
    return ShadowDomSupport__feature;
  }

}

/**
 * @internal
 */
function attachShadow(context: ComponentContext, init: ShadowRootInit): ShadowRoot | undefined {

  const element = context.element;
  const shadowRoot = shadowRootOf(element, init);

  if (shadowRoot) {
    (shadowRoot as any)[ComponentContext__symbol] = context;
    context.whenOn().once(() => context.dispatchEvent(new ShadowDomEvent('wesib:shadowAttached', { bubbles: true })));
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
