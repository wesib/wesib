/**
 * @module @wesib/wesib
 */
import { noop } from 'call-thru';
import { BootstrapWindow } from '../../boot/globals';
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { RenderSchedule as RenderSchedule_, RenderScheduler as RenderScheduler_ } from './render-scheduler';

const RenderSupport__feature: FeatureDef = {
  setup(setup) {
    setup.provide({
      a: RenderScheduler_,
      by: createRenderScheduler,
      with: [BootstrapWindow],
    });
  },
};

/**
 * Rendering support feature.
 *
 * This feature is automatically enabled when {@link Render @Render} decorator is used.
 *
 * @category Feature
 */
export class RenderSupport {

  static get [FeatureDef__symbol](): FeatureDef {
    return RenderSupport__feature;
  }

}

function createRenderScheduler(window: BootstrapWindow) {

  class RenderScheduler extends RenderScheduler_ {

    newSchedule() {

      let scheduled: () => void = noop;

      class RenderSchedule implements RenderSchedule_ {

        schedule(render: (this: void) => void): void {

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

      return new RenderSchedule();
    }
  }

  return new RenderScheduler();
}
