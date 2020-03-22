/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { noop } from '@proc7ts/call-thru';
import { RenderExecution } from '@proc7ts/render-scheduler';
import { DefaultRenderScheduler } from '../../boot/globals';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { RenderDef } from './render-def';

/**
 * Component's element renderer signature.
 *
 * It has no arguments. It may return either nothing, or a function. In the latter case the returned function will be
 * called immediately to render the element. It may, in turn, return a renderer function, and so on.
 *
 * @category Feature
 */
export type ElementRenderer =
/**
 * @param execution  Render shot execution context.
 *
 * @returns Either delegated renderer, or nothing.
 */
    (
        this: void,
        execution: RenderExecution,
    ) => void | ElementRenderer;

const enum RenderStatus {
  Pending,
  Scheduled,
  Complete,
  Cancelled = -1,
}

/**
 * @category Feature
 */
export const ElementRenderer = {

  /**
   * Enables component element rendering.
   *
   * A `renderer` function call will be scheduled by [[DefaultRenderScheduler]] once component state updated.
   *
   * @param context  Target component context.
   * @param renderer  Element renderer function.
   * @param def  Optional element rendering definition.
   */
  render(
      this: void,
      context: ComponentContext,
      renderer: ElementRenderer,
      def: RenderDef = {},
  ): void {

    const { offline, path = [] } = def;
    const stateTracker = context.get(ComponentState).track(path);
    const schedule = context.get(DefaultRenderScheduler)();

    let status = RenderStatus.Pending;
    const stateSupply = stateTracker.onUpdate(() => {
      if (offline || context.connected) {
        scheduleRenderer();
      } else {
        status = RenderStatus.Pending; // Require rendering next time online
      }
    });

    if (offline) {
      scheduleRenderer();
    } else {
      context.whenOn(supply => {
        supply.whenOff(cancelRenderer); // Prevent rendering while offline
        if (status <= 0) { // There is an update to render. Either pending or previously cancelled.
          scheduleRenderer();
        }
      }).whenOff(reason => {
        // Component destroyed
        cancelRenderer();
        stateSupply.off(reason);
      });
    }

    function scheduleRenderer(): void {
      status = RenderStatus.Scheduled;
      schedule(renderElement);
    }

    function cancelRenderer(): void {
      if (status === RenderStatus.Scheduled) { // Scheduled, but not rendered yet
        schedule(noop);
        status = RenderStatus.Cancelled;
      }
    }

    function renderElement(execution: RenderExecution): void {
      /* istanbul ignore next */
      if (status < 0) {
        // Prevent cancelled rendering

        /*
        Should never happen since render-scheduler v1.1
        As disconnecting in another schedule would correctly cancel this one,
        because it is not executed yet and thus will be replaced by `noop`.
        */
        return;
      }
      status = RenderStatus.Complete;
      for (;;) {

        const newRenderer = renderer(execution);

        if (newRenderer === renderer || typeof newRenderer !== 'function') {
          break;
        }

        renderer = newRenderer;
      }
    }
  },

};
