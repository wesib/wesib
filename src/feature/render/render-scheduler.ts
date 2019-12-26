/**
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';

const RenderScheduler__key = (/*#__PURE__*/ new SingleContextKey<RenderScheduler>('render-scheduler'));

/**
 * Rendering scheduler.
 *
 * Schedules components rendering in order to make it less often. E.g. by utilizing `requestAnimationFrame()`.
 *
 * @category Feature
 */
export abstract class RenderScheduler {

  /**
   * A key of bootstrap, definition, or component context value containing [[RenderScheduler]] instance.
   */
  static get [ContextKey__symbol](): ContextKey<RenderScheduler> {
    return RenderScheduler__key;
  }

  /**
   * Creates new render schedule.
   *
   * @returns New render schedule instance.
   */
  abstract newSchedule(): RenderSchedule;

}

/**
 * Render schedule.
 *
 * @category Feature
 */
export interface RenderSchedule {

  /**
   * Schedules component rendering.
   *
   * Only the latest rendering request has affect. I.e. if multiple rendering have been scheduled then the rendering
   * will be performed by the latest one.
   *
   * @param render  A rendering function.
   */
  schedule(render: (this: void) => void): void;

}
