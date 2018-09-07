import { BootstrapContext, FeatureDef, FeatureType } from '../../feature';

/**
 * Creates a feature that makes components bootstrap in the given `window`.
 *
 * The created feature then can be passed to `bootstrapComponents()` to configure components bootstrap.
 *
 * The window is used to access `window.customElements` and DOM element classes.
 *
 * This window instance is available under `BootstrapContext.windowKey` context value key.
 *
 * @param window A window to bootstrap against.
 */
export function componentsWindow(window: Window): FeatureType {

  class WindowConfigFeature {}

  return FeatureDef.define(
      WindowConfigFeature,
      {
        provides: { key: BootstrapContext.windowKey, provider: () => window },
      });

}
