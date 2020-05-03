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
