import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentPreRenderer } from './component-pre-renderer';
import { ComponentRenderCtl$ } from './component-render-ctl.impl';
import { ComponentRenderer } from './component-renderer';
import { RenderDef } from './render-def';

/**
 * A render control of component.
 *
 * Controls rendering by {@link ComponentRenderer component renderers}.
 *
 * Available in component context.
 *
 * @category Feature
 */
export interface ComponentRenderCtl {

  /**
   * Enables component rendering by the given `renderer`.
   *
   * A `renderer` call will be scheduled by {@link DocumentRenderKit document render kit} once component state updated.
   *
   * The unrooted rendering contexts created during the renderer execution are lifted when execution completes.
   *
   * @param renderer - Component renderer function.
   * @param def - Optional component rendering definition.
   *
   * @returns Renderer supply. The rendering would stop once this supply is cut off.
   */
  renderBy(renderer: ComponentRenderer, def?: RenderDef): Supply;

  /**
   * Enables component pre-rendering by the given pre-renderer.
   *
   * A pre-renderer call will be scheduled by {@link DefaultPreRenderScheduler default pre-render scheduler} once
   * component state updated.
   *
   * The unrooted rendering contexts created during the pre-renderer execution are lifted when execution completes.
   *
   * @param preRenderer - Component pre-renderer function.
   * @param def - Optional component pre-rendering definition.
   *
   * @returns Pre-renderer supply. Pre-rendering would stop once this supply is cut off.
   */
  preRenderBy(preRenderer: ComponentPreRenderer, def?: RenderDef): Supply;

}

/**
 * Component context entry containing {@link ComponentRenderCtl component render control}.
 *
 * @category Feature
 */
export const ComponentRenderCtl: CxEntry<ComponentRenderCtl> = {
  perContext: (/*#__PURE__*/ cxSingle({
    byDefault: target => new ComponentRenderCtl$(target.get(ComponentContext)),
  })),
  toString: () => '[ComponentRenderCtl]',
};
