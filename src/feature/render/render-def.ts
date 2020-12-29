/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
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
 * Element rendering definition.
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
    error?(...messages: any[]): void;

  }

  /**
   * Rendering specifier.
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
   * Rendering specifier provider signature.
   */
  export type Provider =
  /**
   * @param context - A context of component to render.
   *
   * @returns Rendering specifier.
   */
      (
          this: void,
          context: ComponentContext,
      ) => RenderDef.Spec;

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
   * @param context - A context of component to render.
   * @param def - Arbitrary rendering definition.
   *
   * @returns Rendering specifier.
   */
  spec(
      this: void,
      context: ComponentContext,
      def: RenderDef,
  ): RenderDef.Spec {
    return valueByRecipe(def, context);
  },

  /**
   * Fulfills rendering specifier with the given defaults.
   *
   * @param base - Base rendering specifier to fulfill.
   * @param defaults - Defaults that will be applied unless defined in `base` specifier.
   *
   * @return `base` rendering specifier fulfilled by `defaults`.
   */
  fulfill(this: void, base: RenderDef.Spec, defaults: RenderDef.Spec = {}): RenderDef.Spec {

    const { on = defaults.on, error } = base;

    return {
      on,
      error: error ? error.bind(base) : defaults.error && defaults.error.bind(defaults),
    };
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
