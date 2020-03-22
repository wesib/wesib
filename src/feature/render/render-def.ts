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
   * Whether to render element contents while disconnected.
   *
   * When offline rendering is disabled the rendering will be scheduled whenever element is connected.
   *
   * `false` by default. Which means the element contents won't be rendered while disconnected. Rendering will
   * be initiated once element is connected for the first time, or if it is connected after state update.
   */
  readonly offline?: boolean;

  /**
   * A path to component state part the renderer should track.
   *
   * The rendering would trigger only when the target state part is updated. This can be useful e.g. when component has
   * multiple independent sub-views.
   *
   * The full component state is tracked when this property is omitted.
   */
  readonly path?: StatePath;

}
