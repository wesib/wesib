import { RenderExecution, RenderScheduler } from '@frontmeans/render-scheduler';
import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/supply';
import { DocumentRenderKit } from '../../boot/globals';
import { ComponentContext } from '../../component';
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
 * @typeParam TExecution - A type of supported renderer execution context.
 */
export interface ComponentRenderCtl<TExecution extends RenderExecution = RenderExecution> {

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
  renderBy(renderer: ComponentRenderer<TExecution>, def?: RenderDef): Supply;

  /**
   * Builds render control utilizing the given scheduler.
   *
   * @typeParam TNewExecution - A type of renderer execution context supported by constructed render control.
   * @param scheduler - A render scheduler to use.
   *
   * @returns New render control.
   */
  withScheduler<TNewExecution extends RenderExecution>(
      scheduler: RenderScheduler<TNewExecution>,
  ): ComponentRenderCtl<TNewExecution>;

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
            const { element }: { element: Element } = context;
            const { scheduler } = context.get(DocumentRenderKit).contextOf(element);

            return new ComponentRenderCtl$(context, scheduler);
          },
        },
    )
);
