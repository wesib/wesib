import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ElementRenderCtl$ } from './element-render-ctl.impl';
import { ElementRenderer } from './element-renderer';
import { RenderDef } from './render-def';

/**
 * A render control of component's element.
 *
 * Controls rendering by {@link ElementRenderer element renderers}.
 *
 * Available in component context.
 *
 * @category Feature
 */
export interface ElementRenderCtl {

  /**
   * Enables component element rendering by the given `renderer`.
   *
   * A `renderer` call will be scheduled by {@link DefaultRenderScheduler} once component state updated.
   *
   * @param renderer - Element renderer function.
   * @param def - Optional element rendering definition.
   *
   * @returns Render shots supply. Element `renderer` will stop rendering once this supply is cut off.
   */
  renderBy(renderer: ElementRenderer, def?: RenderDef): Supply;

}

/**
 * A key of component context value containing {@link ElementRenderCtl element render control}.
 *
 * @category Feature
 */
export const ElementRenderCtl: ContextRef<ElementRenderCtl> = (
    /*#__PURE__*/ new SingleContextKey<ElementRenderCtl>(
        'element-render-ctl',
        {
          byDefault(values) {
            return new ElementRenderCtl$(values.get(ComponentContext));
          },
        },
    )
);
