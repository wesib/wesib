import { ContextValueKey, SingleValueKey } from '../../common';
import { ComponentContext } from '../../component';
import { WesFeature } from '../../feature';
import { ShadowRootBuilder as ShadowRootBuilder_ } from './shadow-root-builder';

function attachShadow(context: ComponentContext, init: ShadowRootInit): ShadowRoot {

  const element = context.element;

  if ('attachShadow' in element) {
    return element.attachShadow(init);
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
    { provide: ShadowRootBuilder_, value: attachShadow },
  ],
})
export class ShadowDomSupport {

  /**
   * A key of component context value containing a shadow root instance.
   *
   * This is only available when the component is decorated with `@AttachShadow` decorator.
   */
  static readonly shadowRootKey: ContextValueKey<ShadowRoot> = new SingleValueKey('shadow-root');

}
