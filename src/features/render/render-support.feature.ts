import { noop } from '../../common';
import { ComponentContext } from '../../component';
import { BootstrapWindow, Feature } from '../../feature';
import { RenderScheduler as RenderScheduler_ } from './render-scheduler';

/**
 * Rendering support feature.
 *
 * This feature is automatically enabled when `@Render` decorator is used.
 */
@Feature({
  bootstrap(context) {
    context.forComponents({ provide: RenderScheduler_, provider: createRenderScheduler });
  }
})
export class RenderSupport {
}

function createRenderScheduler<T extends object>(ctx: ComponentContext<T>) {

  let scheduled: () => void = noop;
  const window = ctx.get(BootstrapWindow);

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
