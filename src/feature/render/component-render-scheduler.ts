import { RenderSchedule, RenderScheduleOptions, RenderShot } from '@frontmeans/render-scheduler';
import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { trackValue } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { ComponentRenderCtl } from './component-render-ctl';
import { ComponentRenderer } from './component-renderer';
import { RenderDef } from './render-def';

/**
 * A signature of component render scheduler.
 *
 * Schedules render shots to be executed by {@link ComponentRenderCtl component render control}.
 *
 * Available in component context.
 *
 * @category Feature
 */
export type ComponentRenderScheduler =
/**
 * @param options - Options of constructed component render schedule.
 *
 * @returns New render schedule.
 */
    (this: void, options?: ComponentRenderScheduleOptions) => RenderSchedule;

/**
 * Options for render schedule.
 *
 * This is passed to {@link ComponentRenderScheduler component render scheduler} when constructing new render schedule.
 *
 * Generic `RenderSchedule` options are ignored.
 *
 * @category Feature
 */
export interface ComponentRenderScheduleOptions extends RenderScheduleOptions, RenderDef.Options {

  /**
   * When to start the rendering.
   *
   * One of:
   * - `settled` - start rendering when component is {@link ComponentContext.settled settled}.
   * - `connected` (the default) - start rendering when component's element is {@link ComponentContext.connected
   *   connected} to document.
   */
  readonly when?: 'settled' | 'connected';

  /**
   * Reports rendering error. E.g. a render shot execution failure.
   *
   * @param messages - Error messages to report.
   */
  error?(...messages: any[]): void;

}

/**
 * Component context entry containing {@link ComponentRenderScheduler component render scheduler}.
 *
 * @category Feature
 */
export const ComponentRenderScheduler: CxEntry<ComponentRenderScheduler> = {
  perContext: (/*#__PURE__*/ cxSingle({
    byDefault: ComponentRenderScheduler$create,
  })),
  toString: () => '[ComponentRenderScheduler]',
};

function ComponentRenderScheduler$create(target: CxEntry.Target<ComponentRenderScheduler>): ComponentRenderScheduler {

  const renderCtl = target.get(ComponentRenderCtl);

  return (opts = {}): RenderSchedule => {

    const recentShot = trackValue<RenderShot>(noop);
    const renderer: ComponentRenderer = execution => {
      recentShot.it(execution);
    };

    renderCtl.renderBy(renderer, { ...opts, on: recentShot.on });

    return (shot: RenderShot): void => {
      recentShot.it = execution => shot(execution); // Ensure render shot always updated
    };
  };
}
