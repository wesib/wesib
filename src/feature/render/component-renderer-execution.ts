import { RenderExecution } from '@frontmeans/render-scheduler';
import { ComponentRenderer } from './component-renderer';

/**
 * Component renderer execution context.
 *
 * This is passed to {@link ComponentRenderer component renderer} when the latter executed.
 *
 * @category Feature
 */
export interface ComponentRendererExecution extends RenderExecution {

  /**
   * Delegates component rendering to another renderer.
   *
   * After this method call the provided renderer will be used to render the component instead of currently executing
   * one.
   *
   * The given `renderer` will be executed immediately after currently executing one, unless they are the same.
   *
   * @param renderer - A renderer to delegate component rendering to.
   */
  renderBy(this: void, renderer: ComponentRenderer): void;

}
