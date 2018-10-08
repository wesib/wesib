import { noop } from '../../common';
import { ComponentContext } from '../../component';
import { BootstrapContext, WesFeature } from '../../feature';
import { RenderScheduler as RenderScheduler_ } from './render-scheduler';

/**
 * Rendering support feature.
 *
 * This feature is automatically enabled when `@Render` decorator is used.
 */
@WesFeature({
  bootstrap(context) {
    context.forComponents(RenderScheduler_.key, createRenderScheduler);
  }
})
export class RenderSupport {
}

function createRenderScheduler<T extends object>(ctx: ComponentContext<T>) {

  let scheduled: () => void = noop;
  const window = ctx.get(BootstrapContext.windowKey);

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
