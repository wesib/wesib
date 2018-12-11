import { ContextKey, SingleContextKey } from 'context-values';
import { ComponentContext } from '../../component';

/**
 * Shadow root builder function type.
 *
 * An instance of this function is available in component context under `ShadowRootBuilder.key` and is used
 * by `@AttachShadow` decorator to attach shadow root to decorated component's custom element.
 *
 * @param context Target component context.
 * @param init Shadow root initialization options.
 *
 * @returns A shadow root instance for target component.
 */
export type ShadowRootBuilder = <T extends object>(context: ComponentContext<T>, init: ShadowRootInit) => ShadowRoot;

export namespace ShadowRootBuilder {

  /**
   * A key of component context value containing a shadow root builder instance.
   */
  export const key: ContextKey<ShadowRootBuilder> = new SingleContextKey('shadow-root-builder');

}
