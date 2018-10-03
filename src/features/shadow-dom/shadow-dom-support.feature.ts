import { ComponentContext } from '../../component';
import { WesFeature } from '../../feature';
import { ShadowRootBuilder as ShadowRootBuilder_ } from './shadow-root-builder';

class ShadowRootBuilder extends ShadowRootBuilder_ {

  attachShadow(context: ComponentContext, init: ShadowRootInit): ShadowRoot {

    const element = context.element;

    if ('attachShadow' in element) {
      return element.attachShadow(init);
    }

    return element;
  }

}

/**
 * Shadow root support feature.
 *
 * This feature is automatically enabled when `@AttachShadow` decorator is used.
 */
@WesFeature({
  prebootstrap: [
    { key: ShadowRootBuilder_.key, value: new ShadowRootBuilder() },
  ],
})
export class ShadowDomSupport {}
