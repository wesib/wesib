import { RenderExecution } from '@frontmeans/render-scheduler';
import { noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { DefaultRenderKit } from '../../boot/globals';
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

  constructor(private readonly _context: ComponentContext) {
  }

  renderBy(
      renderer: ElementRenderer,
      def: RenderDef = {},
  ): Supply {

    const spec = RenderDef.spec(this._context, def);
    const trigger = RenderDef.trigger(this._context, spec);
    const renderKit = this._context.get(DefaultRenderKit);
    const schedule = renderKit.contextOf(this._context.element).scheduler({
      ...RenderDef.fulfill(spec),
      node: this._context.element as Element,
    });
    const whenConnected = spec.when === 'connected';
    let status = RenderStatus.Pending;
    const startRendering = (): 0 | void => status /* there is an update to render */ && scheduleRenderer();
    const onUpdate = whenConnected
        ? () => this._context.connected && scheduleRenderer()
        : () => this._context.settled && scheduleRenderer();
    const supply = trigger(onUpdate)
        .needs(this._context)
        .whenOff(cancelRenderer);

    (whenConnected ? this._context.whenConnected : this._context.whenSettled)(startRendering);

    return supply;

    function scheduleRenderer(): void {
      status = RenderStatus.Scheduled;
      schedule(renderElement);
    }

    function cancelRenderer(): void {
      if (status === RenderStatus.Scheduled) { // Scheduled, but not rendered yet
        schedule(noop);
      }
      status = RenderStatus.Cancelled;
    }

    function renderElement(execution: RenderExecution): void {
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
