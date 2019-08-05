/**
 * @module @wesib/wesib
 */
/**
 * Element render definition.
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

}
