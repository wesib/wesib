/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { noop } from '@proc7ts/call-thru';
import { ContextRef, ContextValues, SingleContextKey } from '@proc7ts/context-values';
import { StatePath } from '@proc7ts/fun-events';
import { RenderSchedule, RenderScheduleOptions, RenderShot } from '@proc7ts/render-scheduler';
import { ComponentState } from '../state';
import { ElementRenderCtl } from './element-render-ctl';
import { ElementRenderer } from './element-renderer';
import { RenderDef } from './render-def';

/**
 * A signature of element render scheduler.
 *
 * Schedules render shots to be executed by {@link ElementRenderCtl element render control}.
 *
 * Available in component context. Requires {@link StateSupport state support} to be enabled.
 *
 * @category Feature
 */
export type ElementRenderScheduler =
/**
 * @param options  Options of constructed element render schedule.
 *
 * @returns New render schedule.
 */
    (this: void, options?: ElementRenderScheduleOptions) => RenderSchedule;

/**
 * Options for render schedule.
 *
 * This is passed to {@link ElementRenderScheduler element render scheduler} when constructing new render schedule.
 *
 * Generic `RenderSchedule` options are ignored.
 *
 * @category Feature
 */
export interface ElementRenderScheduleOptions extends RenderScheduleOptions, RenderDef {

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
   * A path to component state part the schedule should update when new render shot is scheduled.
   *
   * An unique one will be constructed when omitted.
   */
  readonly path?: StatePath;

  /**
   * Reports rendering error. E.g. a render shot execution failure.
   *
   * @param messages  Error messages to report.
   */
  error?(...messages: any[]): void;

}

/**
 * @internal
 */
function newElementRenderScheduler(context: ContextValues): ElementRenderScheduler {

  const ElementRenderShot__root = Symbol('element-render-shot');
  let scheduleSeq = 0;
  const renderCtl = context.get(ElementRenderCtl);
  const state = context.get(ComponentState);

  return (opts = {}): RenderSchedule => {

    const { path = [ElementRenderShot__root, ++scheduleSeq] } = opts;
    let recentShot: RenderShot = noop;
    const renderer: ElementRenderer = execution => {
      recentShot(execution);
    };

    renderCtl.renderBy(renderer, RenderDef.merge(opts, { path }));

    return (shot: RenderShot): void => {

      const prevShot = shot;

      recentShot = shot;
      state.update(path, shot, prevShot);
    };
  };
}

/**
 * A key of component context value containing {@link ElementRenderScheduler element render scheduler}.
 *
 * @category Feature
 */
export const ElementRenderScheduler: ContextRef<ElementRenderScheduler> = (
    /*#__PURE__*/ new SingleContextKey<ElementRenderScheduler>(
        'element-render-scheduler',
        {
          byDefault: newElementRenderScheduler,
        },
    )
);
