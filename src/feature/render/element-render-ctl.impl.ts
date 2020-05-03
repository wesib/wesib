import { noop } from '@proc7ts/call-thru';
import { EventSupply } from '@proc7ts/fun-events';
import { immediateRenderScheduler, RenderExecution } from '@proc7ts/render-scheduler';
import { DefaultRenderScheduler } from '../../boot/globals';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { ElementRenderCtl } from './element-render-ctl';
import { ElementRenderer } from './element-renderer';
import { RenderDef } from './render-def';

/**
 * @internal
 */
const enum RenderStatus {
  Cancelled = -1,
  Complete = 0,
  Pending = 1,
  Scheduled = 2,
}

/**
 * @internal
 */
export class ElementRenderCtl$ implements ElementRenderCtl {

  private readonly _renders = new Set<() => void>();

  constructor(private readonly _context: ComponentContext) {
  }

  renderBy(
      renderer: ElementRenderer,
      def: RenderDef = {},
  ): EventSupply {

    const { path = [] } = def;
    const error = def.error && def.error.bind(def);
    const stateTracker = this._context.get(ComponentState).track(path);
    const schedule = this._context.get(DefaultRenderScheduler)({
      node: this._context.element,
      error,
    });

    let status = RenderStatus.Pending;
    const supply = stateTracker.onUpdate(() => {
      if (this._context.connected) {
        scheduleRenderer();
      }
    })
        .needs(this._context)
        .whenOff(cancelRenderer);

    this._context.whenConnected(() => {
      if (status) { // There is a pending update to render.
        scheduleRenderer();
      }
    });

    const immediateSchedule = immediateRenderScheduler();

    this._renders.add(renderNow);

    return supply.whenOff(() => this._renders.delete(renderNow));

    function scheduleRenderer(): void {
      status = RenderStatus.Scheduled;
      schedule(renderElement);
    }

    function renderNow(): void {
      immediateSchedule(renderElement);
    }

    function cancelRenderer(): void {
      if (status === RenderStatus.Scheduled) { // Scheduled, but not rendered yet
        schedule(noop);
      }
      status = RenderStatus.Cancelled;
    }

    function renderElement(execution: RenderExecution): void {
      if (status > RenderStatus.Complete) { // Prevent excessive rendering
        status = RenderStatus.Complete;
        for (; ;) {

          const newRenderer = renderer(execution);

          if (newRenderer === renderer || typeof newRenderer !== 'function') {
            break;
          }

          renderer = newRenderer;
        }
      }
    }
  }

  renderNow(): void {
    this._renders.forEach(render => render());
  }

}
