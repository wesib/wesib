/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { StatePath } from '@proc7ts/fun-events';
import { ComponentContext } from '../../component';

/**
 * Element rendering definition.
 *
 * This is either an {@link RenderDef.Options options} specifier, or their {@link RenderDef.Provider provider function}.
 *
 * @category Feature
 */
export type RenderDef =
    | RenderDef.Options
    | RenderDef.Provider;

export namespace RenderDef {

  /**
   * Render definition options.
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
     * A path to component state part the renderer should track.
     *
     * The rendering would trigger only when the target state part is updated. This can be useful e.g. when component
     * has multiple independent sub-views.
     *
     * The full component state is tracked when this property is omitted.
     */
    readonly path?: StatePath;

    /**
     * Reports rendering error. E.g. a render shot execution failure.
     *
     * @param messages  Error messages to report.
     */
    error?(...messages: any[]): void;

  }

  /**
   * Rendering definition options provider signature.
   */
  export type Provider =
  /**
   * @param context  A context of component to render.
   *
   * @returns Rendering definition options.
   */
      (
          this: void,
          context: ComponentContext,
      ) => RenderDef.Options;

}

/**
 * @category Feature
 */
export const RenderDef = {

  /**
   * Builds rendering definition options for component.
   *
   * @param context  A context of component to render.
   * @param def  Arbitrary rendering definition.
   *
   * @returns Rendering definition options.
   */
  options(
      this: void,
      context: ComponentContext,
      def: RenderDef,
  ): RenderDef.Options {
    return typeof def === 'function' ? def(context) : def;
  },

  /**
   * Fulfills rendering definition options with the given defaults.
   *
   * @param base  Base definition options to fulfill.
   * @param defaults  Definition defaults that will be applied unless defined in `base` definition.
   *
   * @return `base` rendering definition options fulfilled by `defaults`.
   */
  fulfill(this: void, base: RenderDef.Options, defaults: RenderDef.Options): RenderDef.Options {

    const { path = defaults.path, error } = base;

    return {
      path,
      error: error ? error.bind(base) : defaults.error && defaults.error.bind(defaults),
    };
  },

};
