import { RenderExecution, RenderScheduler } from '@frontmeans/render-scheduler';
import { noop, valueByRecipe } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentRenderCtl } from './component-render-ctl';
import { ComponentRenderer } from './component-renderer';
import { RenderDef } from './render-def';

const enum RenderStatus {
  Cancelled = -1,
  Complete = 0,
  Pending = 1,
  Scheduled = 2,
}

/**
 * @internal
 */
export class ComponentRenderCtl$<TExecution extends RenderExecution = RenderExecution>
    implements ComponentRenderCtl<TExecution> {

  constructor(
      private readonly _context: ComponentContext,
      private readonly _scheduler: RenderScheduler<TExecution>,
  ) {
  }

  renderBy(
      renderer: ComponentRenderer<TExecution>,
      def: RenderDef = {},
  ): Supply {

    const spec = valueByRecipe(def, this._context);
    const trigger = RenderDef.trigger(this._context, spec);
    const element = this._context.element as Element;
    const schedule = this._scheduler({ ...spec, node: element });
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

    function renderElement(execution: TExecution): void {
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

  withScheduler<TNewExecution extends RenderExecution>(
      scheduler: RenderScheduler<TNewExecution>,
  ): ComponentRenderCtl<TNewExecution> {
    return new ComponentRenderCtl$(this._context, scheduler);
  }

}
