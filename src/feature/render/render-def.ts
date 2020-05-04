/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { StatePath } from '@proc7ts/fun-events';

/**
 * Element rendering definition.
 *
 * @category Feature
 */
export interface RenderDef {

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
   * The rendering would trigger only when the target state part is updated. This can be useful e.g. when component has
   * multiple independent sub-views.
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
 * @category Feature
 */
export const RenderDef = {

  /**
   * Merges two element rendering definitions.
   *
   * @param base  Base definition to extend.
   * @param extension  Definition extension.
   *
   * @return `base` element rendering definition with options overridden by `extension`.
   */
  merge(this: void, base: RenderDef, extension: RenderDef): RenderDef {

    const { path = base.path, error } = extension;

    return {
      path,
      error: error ? error.bind(extension) : base.error && base.error.bind(base),
    };
  },

};
