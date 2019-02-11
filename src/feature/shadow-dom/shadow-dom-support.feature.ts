import { ComponentContext, ComponentEventDispatcher } from '../../component';
import { Feature } from '../feature.decorator';
import { ShadowDomEvent } from './shadow-dom-event';
import { ShadowRootBuilder } from './shadow-root-builder';

/**
 * Shadow root support feature.
 *
 * This feature is automatically enabled when `@AttachShadow()` decorator is used.
 */
@Feature({
  set: [
    { a: ShadowRootBuilder, is: attachShadow },
  ],
})
export class ShadowDomSupport {}

function attachShadow(context: ComponentContext, init: ShadowRootInit): ShadowRoot {

  const element = context.element;
  const shadowRoot = shadowRootOf(element, init);

  if (shadowRoot) {
    (shadowRoot as any)[ComponentContext.symbol] = context;
    context.get(ComponentEventDispatcher)(context, new ShadowDomEvent('wesib:shadowAttached', { bubbles: true }));
    return shadowRoot;
  }

  return element;
}

function shadowRootOf(element: Element, init: ShadowRootInit): ShadowRoot | undefined {

  const existing = element.shadowRoot;

  if (existing) {
    // Shadow root already attached. Using it.
    return existing;
  }
  if ('attachShadow' in element) {
    return element.attachShadow(init);
  }

  return;
}
