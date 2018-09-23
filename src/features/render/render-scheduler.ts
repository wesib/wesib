import { ContextValueKey, SingleValueKey } from '../../common/context';

/**
 * Rendering scheduler.
 *
 * Schedules components rendering in order to make it less often. E.g. by utilizing `requestAnimationFrame()`.
 */
export abstract class RenderScheduler {

  /**
   * A `RenderScheduler` component context value key.
   */
  static readonly key: ContextValueKey<RenderScheduler> = new SingleValueKey('render-scheduler');

  /**
   * Schedules component rendering.
   *
   * Only the latest rendering request has affect. I.e. if multiple rendering have been scheduled then the rendering
   * will be performed by the latest one.
   *
   * @param render A rendering function.
   */
  abstract scheduleRender(render: (this: void) => void): void;

}
