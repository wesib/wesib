import { RenderExecution, RenderSchedule } from '@frontmeans/render-scheduler';
import { noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { DocumentRenderKit } from '../../boot/globals';
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
export class ComponentRenderCtl$ implements ComponentRenderCtl {

  constructor(private readonly _context: ComponentContext) {
  }

  renderBy<TExecution extends RenderExecution>(
      renderer: ComponentRenderer<TExecution>,
      def: RenderDef<TExecution> = {},
  ): Supply {

    const spec = RenderDef.spec<TExecution>(this._context, def);
    const trigger = RenderDef.trigger(this._context, spec);
    const schedule = ComponentRenderCtl$createSchedule(this._context, spec);
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

}

function ComponentRenderCtl$createSchedule<TExecution extends RenderExecution>(
    context: ComponentContext,
    spec: RenderDef.Spec<TExecution>,
): RenderSchedule<TExecution> {

  const { schedule } = spec;

  if (schedule) {
    return schedule;
  }

  const element = context.element as Element;

  return context
      .get(DocumentRenderKit)
      .contextOf(element)
      .scheduler({
        ...spec,
        node: element,
      }) as RenderSchedule<TExecution>;
}
