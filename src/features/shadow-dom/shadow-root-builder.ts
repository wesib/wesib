import { ContextValueKey, SingleValueKey } from '../../common';
import { ComponentContext } from '../../component';

/**
 * Shadow root builder.
 *
 * An instance of this class is available in component context under `ShadowRootBuilder.key` and is used
 * by `@AttachShadow` decorator to attach shadow root to decorated component's custom element.
 */
export abstract class ShadowRootBuilder {

  /**
   * A key of component context value containing a shadow root builder instance.
   */
  static readonly key: ContextValueKey<ShadowRootBuilder> = new SingleValueKey('shadow-root-builder');

  /**
   * Attaches shadow root to custom element.
   *
   * @param context Component context.
   * @param init Shadow root initialization options.
   *
   * @return Shadow root instance. Or element instance if shadow DOM is not supported by target element.
   */
  abstract attachShadow(context: ComponentContext, init: ShadowRootInit): ShadowRoot;

}
