import { noop } from 'call-thru';
import { BootstrapWindow } from '../../kit';
import { Feature } from '../feature.decorator';
import { RenderScheduler as RenderScheduler_ } from './render-scheduler';

/**
 * Rendering support feature.
 *
 * This feature is automatically enabled when `@Render` decorator is used.
 */
@Feature({
  forComponents: {
    a: RenderScheduler_,
    by: createRenderScheduler,
    with: [BootstrapWindow],
  }
})
export class RenderSupport {}

function createRenderScheduler<T extends object>(window: BootstrapWindow) {

  let scheduled: () => void = noop;

  class RenderScheduler extends RenderScheduler_ {

    scheduleRender(render: (this: void) => void): void {

      const previouslyScheduled = scheduled;

      scheduled = render;
      if (previouslyScheduled === noop) {
        window.requestAnimationFrame(() => {
          scheduled();
          scheduled = noop;
        });
      }
    }

  }

  return new RenderScheduler();
}
