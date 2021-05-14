import {
  EventSender,
  isEventSender,
  OnEvent,
  onSupplied,
  StatePath,
  supplyOn,
  translateOn_,
} from '@proc7ts/fun-events';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { ComponentPreRendererExecution } from './component-pre-renderer-execution';
import { ComponentRendererExecution } from './component-renderer-execution';

/**
 * Component rendering definition.
 *
 * This is either a {@link RenderDef.Spec rendering specifier}, or its {@link RenderDef.Provider provider function}.
 *
 * @category Feature
 */
export type RenderDef =
    | RenderDef.Spec
    | RenderDef.Provider;

/**
 * @category Feature
 */
export namespace RenderDef {

  /**
   * Component render method signature.
   */
  export type Method =
  /**
   * @param execution - Component renderer execution context.
   */
      (execution: ComponentRendererExecution) => void;

  /**
   * Component pre-render method signature.
   */
  export type PreMethod =
  /**
   * @param execution - Component pre-renderer execution context.
   */
      (execution: ComponentPreRendererExecution) => void;

  /**
   * Rendering options.
   */
  export interface Options {

    /**
     * When to start the rendering.
     *
     * One of:
     * - `settled` (the default) - start rendering when component is {@link ComponentContext.settled settled}.
     * - `connected` - start rendering when component's element is {@link ComponentContext.connected connected}
     *   to document.
     */
    readonly when?: 'settled' | 'connected';

    /**
     * Reports rendering error. E.g. a render shot execution failure.
     *
     * @param messages - Error messages to report.
     */
    error?(this: void, ...messages: any[]): void;

  }

  /**
   * Component rendering specifier.
   */
  export interface Spec extends Options {

    /**
     * A trigger that issues rendering.
     *
     * This can be useful e.g. when component has multiple independent sub-views.
     *
     * This can be one of the following:
     * - A path to component state part the renderer should track. The rendering would trigger only when the target
     *   state part is updated.
     * - Arbitrary event sender. The rendering would be triggered on any event from this sender.
     *
     * A root state path is tracked when omitted.
     *
     * When trigger is a root path (the default value), then the rendering will be triggered by any state update.
     * Except for updates of sub-states inside {@link RenderPath__root}.
     */
    readonly on?: StatePath | EventSender<[]>;

  }

  /**
   * Component rendering provider signature.
   *
   * @typeParam TSpec - Provided rendering specifier type.
   */
  export type Provider<TSpec extends Spec = Spec> =
  /**
   * @param context - A context of component to render.
   *
   * @returns Rendering specifier.
   */
      (
          this: void,
          context: ComponentContext,
      ) => TSpec;

}

/**
 * A root path to sub-states updates to which will be ignored by default.
 *
 * This can be used to create sub-states that won't trigger rendering occasionally, but only when requested explicitly.
 *
 * @category Feature
 */
export const RenderPath__root = (/*#__PURE__*/ Symbol('render'));

/**
 * @category Feature
 */
export const RenderDef = {

  /**
   * Builds a trigger issuing rendering updates.
   *
   * @param context - Rendered component context.
   * @param spec - Rendering specifier.
   *
   * @returns `OnEvent` sender that sends an event each time the rendering required.
   */
  trigger(
      this: void,
      context: ComponentContext,
      spec: RenderDef.Spec = {},
  ): OnEvent<[]> {

    const { on = [] } = spec;

    if ((typeof on === 'object' || typeof on === 'function') && isEventSender(on)) {
      return onSupplied(on).do(supplyOn(context));
    }

    const trigger = context
        .get(ComponentState)
        .track(on)
        .onUpdate.do(
            supplyOn(context),
        );

    if (Array.isArray(on) && !on.length) {
      return trigger.do(translateOn_(
          (send, path: StatePath.Normalized) => path[0] !== RenderPath__root && send(),
      ));
    }

    return trigger;
  },

};
