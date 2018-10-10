import { ComponentContext } from '../../component';
import { WesFeature } from '../../feature';
import { ShadowRootBuilder } from './shadow-root-builder';

function attachShadow(context: ComponentContext, init: ShadowRootInit): ShadowRoot {

  const element = context.element;

  if ('attachShadow' in element) {

    const shadowRoot = element.attachShadow(init);

    (shadowRoot as any)[ComponentContext.symbol] = context;

    return shadowRoot;
  }

  return element;
}

/**
 * Shadow root support feature.
 *
 * This feature is automatically enabled when `@AttachShadow` decorator is used.
 */
@WesFeature({
  prebootstrap: [
    { provide: ShadowRootBuilder, value: attachShadow },
  ],
})
export class ShadowDomSupport {}
