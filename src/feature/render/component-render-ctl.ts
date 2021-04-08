import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
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
   * @param renderer - Component renderer function.
   * @param def - Optional component rendering definition.
   *
   * @returns Render shots supply. Component's `renderer` would stop rendering once this supply is cut off.
   */
  renderBy(renderer: ComponentRenderer, def?: RenderDef): Supply;

  preRenderBy(preRenderer: ComponentPreRenderer, def?: RenderDef): Supply;

}

/**
 * A key of component context value containing {@link ComponentRenderCtl component render control}.
 *
 * @category Feature
 */
export const ComponentRenderCtl: ContextRef<ComponentRenderCtl> = (
    /*#__PURE__*/ new SingleContextKey<ComponentRenderCtl>(
        'component-render-ctl',
        {
          byDefault(values) {

            const context = values.get(ComponentContext);

            return new ComponentRenderCtl$(context);
          },
        },
    )
);
