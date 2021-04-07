import { RenderExecution, RenderSchedule } from '@frontmeans/render-scheduler';
import {
  EventSender,
  isEventSender,
  OnEvent,
  onSupplied,
  StatePath,
  supplyOn,
  translateOn_,
} from '@proc7ts/fun-events';
import { valueByRecipe } from '@proc7ts/primitives';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';

/**
 * Component rendering definition.
 *
 * This is either a {@link RenderDef.Spec rendering specifier}, or its {@link RenderDef.Provider provider function}.
 *
 * @category Feature
 * @typeParam TExecution - A type of supported renderer execution context.
 */
export type RenderDef<TExecution extends RenderExecution = RenderExecution> =
    | RenderDef.Spec<TExecution>
    | RenderDef.Provider<RenderDef.Spec<TExecution>>;

/**
 * @category Feature
 */
export namespace RenderDef {

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
   *
   * @typeParam TExecution - A type of supported renderer execution context.
   */
  export interface Spec<TExecution extends RenderExecution = RenderExecution> extends Options {

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

    /**
     * Renderer execution schedule.
     */
    readonly schedule?: RenderSchedule<TExecution>;

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

  /**
   * Component rendering definition scheduled by particular schedule.
   *
   * @typeParam TExecution - A type of supported renderer execution context.
   */
  export type Scheduled<TExecution extends RenderExecution = RenderExecution> =
      | ScheduledSpec<TExecution>
      | Provider<ScheduledSpec<TExecution>>;

  /**
   * Component rendering specifier scheduled by particular schedule.
   *
   * @typeParam TExecution - A type of supported renderer execution context.
   */
  export interface ScheduledSpec<TExecution extends RenderExecution = RenderExecution> extends Spec<TExecution> {

    /**
     * Renderer execution schedule.
     */
    readonly schedule: RenderSchedule<TExecution>;

  }

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
   * Builds a rendering specifier for component by its definition.
   *
   * @typeParam TExecution - A type of supported renderer execution context.
   * @param context - A context of component to render.
   * @param def - Arbitrary rendering definition.
   *
   * @returns Rendering specifier.
   */
  spec<TExecution extends RenderExecution>(
      this: void,
      context: ComponentContext,
      def: RenderDef<TExecution>,
  ): RenderDef.Spec<TExecution> {
    return valueByRecipe(def, context);
  },

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
