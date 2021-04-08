import { RenderExecution, RenderSchedule, RenderScheduler, RenderShot } from '@frontmeans/render-scheduler';
import { noop, valueByRecipe } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { DefaultPreRenderScheduler, DocumentRenderKit } from '../../boot/globals';
import { ComponentContext } from '../../component';
import { ComponentPreRenderer } from './component-pre-renderer';
import { ComponentPreRendererExecution } from './component-pre-renderer-execution';
import { ComponentRenderCtl } from './component-render-ctl';
import { ComponentRenderer } from './component-renderer';
import { ComponentRendererExecution } from './component-renderer-execution';
import { RenderDef } from './render-def';

/**
 * @internal
 */
export class ComponentRenderCtl$ implements ComponentRenderCtl {

  readonly _scheduler: RenderScheduler;

  constructor(readonly _context: ComponentContext) {

    const { element }: { element: Element } = _context;

    this._scheduler = _context.get(DocumentRenderKit).contextOf(element).scheduler;
  }

  renderBy(renderer: ComponentRenderer, def?: RenderDef): Supply {
    return new ComponentRenderer$State(this, renderer, def).render();
  }

  preRenderBy(preRenderer: ComponentPreRenderer, def?: RenderDef): Supply {
    return new ComponentPreRenderer$State(this, preRenderer, def).render();
  }

}

const enum RenderStatus {
  Cancelled = -1,
  Complete = 0,
  Pending = 1,
  Scheduled = 2,
}

abstract class ComponentRenderer$BaseState<TExecution extends RenderExecution> {

  protected _supply!: Supply;
  private _status: RenderStatus = RenderStatus.Pending;
  protected _spec: RenderDef.Spec;

  constructor(
      protected readonly _ctl: ComponentRenderCtl$,
      protected _renderer: RenderShot<TExecution>,
      def: RenderDef = {},
  ) {
    this._spec = valueByRecipe(def, _ctl._context);
  }

  render(): Supply {

    const context = this._ctl._context;
    const trigger = RenderDef.trigger(context, this._spec);
    const schedule = this._createSchedule();
    const whenConnected = this._spec.when === 'connected';
    const startRendering = (): 0 | void => this._status /* there is an update to render */ && this._schedule(schedule);
    const onUpdate = whenConnected
        ? () => context.connected && this._schedule(schedule)
        : () => context.settled && this._schedule(schedule);
    this._supply = trigger(onUpdate)
        .needs(context)
        .whenOff(() => this._cancel(schedule));

    (whenConnected ? context.whenConnected : context.whenSettled)(startRendering);

    return this._supply;
  }

  protected _createSchedule(): RenderSchedule {

    const element: Element = this._ctl._context.element;

    return this._ctl._scheduler({ ...this._spec, node: element });
  }

  private _schedule(schedule: RenderSchedule): void {
    this._status = RenderStatus.Scheduled;
    schedule(execution => this._render(execution));
  }

  protected _render(execution: RenderExecution): void {
    this._status = RenderStatus.Complete;
    do {

      const currentRenderer = this._renderer;

      currentRenderer(this._createExecution(execution));
      if (this._renderer === currentRenderer) {
        break; // The renderer is not updated. Current renderer execution is over.
      }
    } while (this._status >= 0); // The rendering could be cancelled by the renderer itself.
  }

  private _cancel(schedule: RenderSchedule): void {
    if (this._status === RenderStatus.Scheduled) { // Scheduled, but not rendered yet.
      schedule(noop);
    }
    this._status = RenderStatus.Cancelled;
  }

  protected abstract _createExecution(execution: RenderExecution): TExecution;

}

class ComponentRenderer$State extends ComponentRenderer$BaseState<ComponentRendererExecution> {

  protected _createExecution(execution: RenderExecution): ComponentRendererExecution {

    const rendererExecution: ComponentRendererExecution = {
      ...execution,
      postpone(postponed) {
        execution.postpone(() => postponed(rendererExecution));
      },
      supply: this._supply,
      renderBy: (renderer: ComponentRenderer) => {
        this._renderer = renderer;
      },
    };

    return rendererExecution;
  }

}

class ComponentPreRenderer$State extends ComponentRenderer$BaseState<ComponentPreRendererExecution> {

  private _nextRenderer: ComponentRenderer | null = null;
  private _preSupply!: Supply;

  render(): Supply {

    const supply = new Supply();

    this._preSupply = super.render();
    this._preSupply.whenOff(reason => {
      if (reason === this) {
        // Pre-rendering is over.
        // Delegate to component renderer.
        supply.needs(this._ctl.renderBy(this._nextRenderer!));
      } else {
        // Pre-rendering aborted.
        supply.off(reason);
      }
    });

    return supply;
  }

  protected _createSchedule(): RenderSchedule {

    const context = this._ctl._context;
    const element: Element = context.element;

    return context.get(DefaultPreRenderScheduler)({ ...this._spec, node: element });
  }

  protected _render(execution: RenderExecution): void {
    super._render(execution);
    if (this._nextRenderer) {
      // Signal the pre-rendering is over.
      this._preSupply.off(this);
    }
  }

  protected _createExecution(execution: RenderExecution): ComponentPreRendererExecution {

    const preRendererExecution: ComponentPreRendererExecution = {
      ...execution,
      postpone(postponed) {
        execution.postpone(() => postponed(preRendererExecution));
      },
      supply: this._supply,
      renderBy: (renderer: ComponentRenderer) => {
        this._nextRenderer = renderer;
      },
      preRenderBy: (preRenderer: ComponentPreRenderer) => {
        this._renderer = preRenderer;
      },
    };

    return preRendererExecution;
  }

}
