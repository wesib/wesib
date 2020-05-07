import { noop } from '@proc7ts/call-thru';
import { EventSupply } from '@proc7ts/fun-events';
import { immediateRenderScheduler, RenderExecution } from '@proc7ts/render-scheduler';
import { DefaultRenderScheduler } from '../../boot/globals';
import { ComponentContext } from '../../component';
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

    const spec = RenderDef.spec(this._context, def);
    const trigger = RenderDef.trigger(this._context, spec);
    const schedule = this._context.get(DefaultRenderScheduler)({
      ...RenderDef.fulfill(spec),
      node: this._context.element,
    });
    const whenConnected = spec.when === 'connected';
    let status = RenderStatus.Pending;
    const startRendering = (): 0 | void => status /* there is an update to render */ && scheduleRenderer();
    const onUpdate = whenConnected
        ? () => this._context.connected && scheduleRenderer()
        : () => this._context.settled && scheduleRenderer();
    const supply = trigger
        .to(onUpdate)
        .needs(this._context)
        .whenOff(cancelRenderer);

    (whenConnected ? this._context.whenConnected() : this._context.whenSettled()).to(startRendering);

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
