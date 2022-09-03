import { RenderExecution } from '@frontmeans/render-scheduler';
import { Supply } from '@proc7ts/supply';
import { ComponentPreRenderer } from './component-pre-renderer';
import { ComponentRenderer } from './component-renderer';

/**
 * Component pre-renderer execution context.
 *
 * This is passed to {@link ComponentPreRenderer component pre-renderer} when the latter executed.
 *
 * @category Feature
 */
export interface ComponentPreRendererExecution extends RenderExecution {
  /**
   * Pre-renderer supply. Pre-rendering would stop once this supply is cut off.
   *
   * This is the same supply as the one returned from {@link ComponentRenderCtl.preRenderBy}.
   */
  readonly supply: Supply;

  /**
   * Enables component rendering by the given `renderer` when pre-rendering completes.
   *
   * @param renderer - A renderer to delegate component rendering to.
   */
  renderBy(this: void, renderer: ComponentRenderer): void;

  /**
   * Delegates component pre-rendering to another pre-renderer.
   *
   * After this method call the given pre-renderer will be used to pre-render the component instead of currently
   * executing one.
   *
   * The given pre-renderer will be executed immediately after currently executing one, unless they are the same.
   *
   * @param preRenderer - A pre-renderer to delegate component pre-rendering to.
   */
  preRenderBy(this: void, preRenderer: ComponentPreRenderer): void;
}
