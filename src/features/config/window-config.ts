import { SingleValueKey } from '../../common';
import { FeatureDef, FeatureType } from '../../feature';

/**
 * Target window configuration.
 *
 * This can be passed to `bootstrapComponents(WindowConfig.configure({}))` function in order to customize components
 * bootstrap.
 *
 * Target configuration the will be available in all contexts under `WindowConfig.key` context value key.
 */
export interface WindowConfig {

  /**
   * A window instance custom components are registered for.
   *
   * This instance is used to access `window.customElements` and HTML element classes.
   */
  window: Window;

}

export namespace WindowConfig {

  /**
   * A key of context value containing a window configuration.
   *
   * Target value defaults to current window.
   */
  export const key = new SingleValueKey<WindowConfig>('window-config', { window });

  /**
   * Creates a window configuration feature.
   *
   * The created feature then can be passed to `bootstrapComponents()` to configure components bootstrap.
   *
   * @param config A window configuration to apply.
   */
  export function configure(config: WindowConfig): FeatureType {

    class WindowConfigFeature {}

    return FeatureDef.define(
        WindowConfigFeature,
        {
          provides: { key, provider: () => config },
        });
  }

}
